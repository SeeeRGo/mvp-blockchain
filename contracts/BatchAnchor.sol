// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BatchAnchor
 * @dev Contract for anchoring batches of diploma hashes on-chain using Merkle trees
 */
contract BatchAnchor {
    struct Batch {
        address publisher;
        bytes32 merkleRoot;
        uint256 timestamp;
        uint256 diplomaCount;
    }

    mapping(bytes32 => Batch) public batches;
    mapping(address => bytes32[]) public publisherBatches;
    address public registry;
    uint256 public batchCount;

    event BatchAnchored(
        bytes32 indexed batchId,
        address indexed publisher,
        bytes32 merkleRoot,
        uint256 timestamp,
        uint256 diplomaCount
    );

    /**
     * @dev Constructor sets the publisher registry address
     * @param _registry The address of the PublisherRegistry contract
     */
    constructor(address _registry) {
        registry = _registry;
    }

    /**
     * @dev Anchor a batch of diplomas on-chain
     * @param _batchId Unique identifier for the batch
     * @param _merkleRoot The Merkle root of the batch
     * @param _diplomaCount Number of diplomas in the batch
     */
    function anchorBatch(
        bytes32 _batchId,
        bytes32 _merkleRoot,
        uint256 _diplomaCount
    ) external {
        // Verify publisher is attested
        require(
            PublisherRegistry(registry).isPublisherAttested(msg.sender),
            "Publisher not attested"
        );

        // Store batch
        batches[_batchId] = Batch({
            publisher: msg.sender,
            merkleRoot: _merkleRoot,
            timestamp: block.timestamp,
            diplomaCount: _diplomaCount
        });

        // Track publisher batches
        publisherBatches[msg.sender].push(_batchId);
        batchCount++;

        emit BatchAnchored(
            _batchId,
            msg.sender,
            _merkleRoot,
            block.timestamp,
            _diplomaCount
        );
    }

    /**
     * @dev Get batch information
     * @param _batchId The batch identifier
     * @return publisher The publisher's address
     * @return merkleRoot The Merkle root of the batch
     * @return timestamp The timestamp when batch was anchored
     * @return diplomaCount The number of diplomas in the batch
     */
    function getBatch(bytes32 _batchId) 
        external 
        view 
        returns (
            address publisher,
            bytes32 merkleRoot,
            uint256 timestamp,
            uint256 diplomaCount
        ) 
    {
        Batch memory batch = batches[_batchId];
        return (
            batch.publisher,
            batch.merkleRoot,
            batch.timestamp,
            batch.diplomaCount
        );
    }

    /**
     * @dev Verify a diploma using Merkle proof
     * @param _batchId The batch identifier
     * @param _diplomaHash The hash of the diploma
     * @param _merkleProof The Merkle proof array
     * @return bool True if proof is valid, false otherwise
     */
    function verifyDiploma(
        bytes32 _batchId,
        bytes32 _diplomaHash,
        bytes32[] calldata _merkleProof
    ) external pure returns (bool) {
        bytes32 computedHash = _diplomaHash;
        
        for (uint256 i = 0; i < _merkleProof.length; i++) {
            bytes32 proofElement = _merkleProof[i];
            
            if (computedHash < proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        
        return computedHash == batches[_batchId].merkleRoot;
    }

    /**
     * @dev Get all batches for a publisher
     * @param _publisher The publisher's address
     * @return Array of batch IDs
     */
    function getPublisherBatches(address _publisher) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return publisherBatches[_publisher];
    }
}

/**
 * @dev Interface for PublisherRegistry contract
 */
interface PublisherRegistry {
    function isPublisherAttested(address _publisherKey) external view returns (bool);
}
