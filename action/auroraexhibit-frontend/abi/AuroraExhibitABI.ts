export const AuroraExhibitABI = {
  abi: [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "pieceId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "liker",
        "type": "address"
      }
    ],
    "name": "PieceApplauded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "pieceId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "category",
        "type": "string"
      }
    ],
    "name": "PieceEndorsed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "pieceId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "artist",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      }
    ],
    "name": "PieceMinted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "pieceId",
        "type": "uint256"
      }
    ],
    "name": "applaud",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "pieceId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "category",
        "type": "string"
      }
    ],
    "name": "endorse",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "pieceId",
        "type": "uint256"
      }
    ],
    "name": "fetchPiece",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "artist",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "descriptionHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "fileHash",
        "type": "string"
      },
      {
        "internalType": "string[]",
        "name": "tags",
        "type": "string[]"
      },
      {
        "internalType": "string[]",
        "name": "categories",
        "type": "string[]"
      },
      {
        "internalType": "uint64",
        "name": "timestamp",
        "type": "uint64"
      },
      {
        "internalType": "euint32",
        "name": "likesHandle",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "listPieces",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "ids",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "descriptionHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "fileHash",
        "type": "string"
      },
      {
        "internalType": "string[]",
        "name": "tags",
        "type": "string[]"
      },
      {
        "internalType": "string[]",
        "name": "categories",
        "type": "string[]"
      }
    ],
    "name": "mintPiece",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "pieceId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextPieceId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "protocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "pieceId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "category",
        "type": "string"
      }
    ],
    "name": "tallyFor",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "votesHandle",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
};
