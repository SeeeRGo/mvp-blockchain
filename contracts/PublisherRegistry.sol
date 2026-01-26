// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PublisherRegistry
 * @dev Registry for attesting university publishers on-chain
 */
contract PublisherRegistry {
    struct Publisher {
        address publisherKey;
        string universityName;
        uint256 attestedAt;
        bool isActive;
    }

    mapping(address => Publisher) public publishers;
    address public admin;
    uint256 public publisherCount;

    event PublisherAttested(
        address indexed publisherKey,
        string universityName,
        uint256 timestamp
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Attest a new publisher (university)
     * @param _publisherKey The Ethereum address of the publisher
     * @param _universityName The name of the university
     */
    function attestPublisher(
        address _publisherKey,
        string calldata _universityName
    ) external onlyAdmin {
        require(_publisherKey != address(0), "Invalid address");
        require(!publishers[_publisherKey].isActive, "Already attested");

        publishers[_publisherKey] = Publisher({
            publisherKey: _publisherKey,
            universityName: _universityName,
            attestedAt: block.timestamp,
            isActive: true
        });

        publisherCount++;

        emit PublisherAttested(_publisherKey, _universityName, block.timestamp);
    }

    /**
     * @dev Check if a publisher is attested
     * @param _publisherKey The Ethereum address of the publisher
     * @return bool True if attested, false otherwise
     */
    function isPublisherAttested(address _publisherKey) 
        external 
        view 
        returns (bool) 
    {
        return publishers[_publisherKey].isActive;
    }

    /**
     * @dev Get publisher information
     * @param _publisherKey The Ethereum address of the publisher
     * @return publisherKey The publisher's Ethereum address
     * @return universityName The name of the university
     * @return attestedAt The timestamp when attested
     * @return isActive Whether the publisher is active
     */
    function getPublisherInfo(address _publisherKey) 
        external 
        view 
        returns (
            address publisherKey,
            string memory universityName,
            uint256 attestedAt,
            bool isActive
        ) 
    {
        Publisher memory publisher = publishers[_publisherKey];
        return (
            publisher.publisherKey,
            publisher.universityName,
            publisher.attestedAt,
            publisher.isActive
        );
    }

    /**
     * @dev Transfer admin rights
     * @param _newAdmin The address of the new admin
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }
}
