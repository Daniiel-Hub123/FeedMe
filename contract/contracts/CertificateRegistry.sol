// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CertificateRegistry {
    struct Certificate {
        string id;
        address recipient;
        address issuer;
        bytes32 metadataHash;
        string metadataURI;
        uint256 issuedAt;
        bool revoked;
        bool exists;
    }

    mapping(string => Certificate) private certificates;

    event CertificateIssued(
        string id,
        address indexed recipient,
        address indexed issuer,
        bytes32 metadataHash,
        string metadataURI,
        uint256 issuedAt
    );

    event CertificateRevoked(string id, uint256 revokedAt);

    function issueCertificate(
        string calldata id,
        address recipient,
        bytes32 metadataHash,
        string calldata metadataURI
    ) external {
        require(!certificates[id].exists, "Certificate already exists");
        require(recipient != address(0), "Invalid recipient");

        certificates[id] = Certificate({
            id: id,
            recipient: recipient,
            issuer: msg.sender,
            metadataHash: metadataHash,
            metadataURI: metadataURI,
            issuedAt: block.timestamp,
            revoked: false,
            exists: true
        });

        emit CertificateIssued(
            id,
            recipient,
            msg.sender,
            metadataHash,
            metadataURI,
            block.timestamp
        );
    }

    function revokeCertificate(string calldata id) external {
        require(certificates[id].exists, "Certificate does not exist");
        require(certificates[id].issuer == msg.sender, "Not certificate issuer");
        require(!certificates[id].revoked, "Already revoked");

        certificates[id].revoked = true;

        emit CertificateRevoked(id, block.timestamp);
    }

    function getCertificate(string calldata id)
        external
        view
        returns (
            string memory,
            address,
            address,
            bytes32,
            string memory,
            uint256,
            bool,
            bool
        )
    {
        Certificate memory cert = certificates[id];
        return (
            cert.id,
            cert.recipient,
            cert.issuer,
            cert.metadataHash,
            cert.metadataURI,
            cert.issuedAt,
            cert.revoked,
            cert.exists
        );
    }
}