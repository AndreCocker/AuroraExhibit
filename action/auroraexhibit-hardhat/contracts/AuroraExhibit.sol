// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title AuroraExhibit – 隐私友好的链上艺术展（FHE 版）
/// @notice 功能与 GhostGallery 基本一致，但接口命名与事件命名均已更新。
contract AuroraExhibit is SepoliaConfig {
    struct ExhibitPiece {
        uint256 id;                    // 作品ID
        address artist;                // 匿名作者地址
        string title;                  // 标题（明文）
        string descriptionHash;        // 简介哈希（外链）
        string fileHash;               // 文件哈希
        string[] tags;                 // 标签（明文）
        string[] categories;           // 类别（明文）
        euint32 likesEnc;              // 加密点赞计数
        uint64 timestamp;              // 上链时间
    }

    uint256 public nextPieceId = 1;

    mapping(uint256 => ExhibitPiece) private _pieces;
    uint256[] private _pieceIds;

    // (pieceId, category) -> encrypted votes
    mapping(uint256 => mapping(bytes32 => euint32)) private _votesByPieceAndCategory;
    mapping(uint256 => mapping(bytes32 => bool)) private _votesInitialized;

    // 事件（新命名）
    event PieceMinted(uint256 indexed pieceId, address indexed artist, string title);
    event PieceApplauded(uint256 indexed pieceId, address indexed liker);
    event PieceEndorsed(uint256 indexed pieceId, address indexed voter, string category);

    /// @notice 铸造/登记一件作品（原 uploadArtwork）
    function mintPiece(
        string calldata title,
        string calldata descriptionHash,
        string calldata fileHash,
        string[] calldata tags,
        string[] calldata categories
    ) external returns (uint256 pieceId) {
        pieceId = nextPieceId++;

        euint32 likes = FHE.asEuint32(0);

        ExhibitPiece storage p = _pieces[pieceId];
        p.id = pieceId;
        p.artist = msg.sender;
        p.title = title;
        p.descriptionHash = descriptionHash;
        p.fileHash = fileHash;
        p.timestamp = uint64(block.timestamp);
        p.likesEnc = likes;

        for (uint256 i = 0; i < tags.length; i++) {
            p.tags.push(tags[i]);
        }
        for (uint256 i = 0; i < categories.length; i++) {
            p.categories.push(categories[i]);
        }

        // 授权：合约自身与作者可以解密 likesEnc
        FHE.allowThis(p.likesEnc);
        FHE.allow(p.likesEnc, msg.sender);

        _pieceIds.push(pieceId);

        emit PieceMinted(pieceId, msg.sender, title);
    }

    /// @notice 为作品鼓掌（原 likeArtwork）
    function applaud(uint256 pieceId) external {
        ExhibitPiece storage p = _pieces[pieceId];
        require(p.artist != address(0), "Piece not found");

        p.likesEnc = FHE.add(p.likesEnc, 1);

        FHE.allowThis(p.likesEnc);
        FHE.allow(p.likesEnc, p.artist);
        FHE.allowTransient(p.likesEnc, msg.sender);

        emit PieceApplauded(pieceId, msg.sender);
    }

    /// @notice 类别背书（原 voteArtwork）
    function endorse(uint256 pieceId, string calldata category) external {
        ExhibitPiece storage p = _pieces[pieceId];
        require(p.artist != address(0), "Piece not found");

        bool belongsToCategory = false;
        for (uint256 i = 0; i < p.categories.length; i++) {
            if (keccak256(bytes(p.categories[i])) == keccak256(bytes(category))) {
                belongsToCategory = true;
                break;
            }
        }
        require(belongsToCategory, "Piece does not belong to this category");

        bytes32 catKey = keccak256(bytes(category));
        euint32 current = _votesByPieceAndCategory[pieceId][catKey];
        if (!_votesInitialized[pieceId][catKey]) {
            current = FHE.asEuint32(0);
            _votesInitialized[pieceId][catKey] = true;
        }
        current = FHE.add(current, 1);
        _votesByPieceAndCategory[pieceId][catKey] = current;

        FHE.allowThis(current);
        FHE.allow(current, p.artist);
        FHE.allowTransient(current, msg.sender);

        emit PieceEndorsed(pieceId, msg.sender, category);
    }

    /// @notice 获取作品信息（原 getArtwork）
    function fetchPiece(uint256 pieceId)
        external
        view
        returns (
            uint256 id,
            address artist,
            string memory title,
            string memory descriptionHash,
            string memory fileHash,
            string[] memory tags,
            string[] memory categories,
            uint64 timestamp,
            euint32 likesHandle
        )
    {
        ExhibitPiece storage p = _pieces[pieceId];
        require(p.artist != address(0), "Piece not found");
        return (
            p.id,
            p.artist,
            p.title,
            p.descriptionHash,
            p.fileHash,
            p.tags,
            p.categories,
            p.timestamp,
            p.likesEnc
        );
    }

    /// @notice 列出所有作品 ID（原 getAllArtworks）
    function listPieces() external view returns (uint256[] memory ids) {
        return _pieceIds;
    }

    /// @notice 获取某作品在某类别下的背书计数句柄（原 getVotes）
    function tallyFor(uint256 pieceId, string calldata category) external view returns (euint32 votesHandle) {
        bytes32 catKey = keccak256(bytes(category));
        return _votesByPieceAndCategory[pieceId][catKey];
    }
}


