pragma solidity >=0.7.0 <0.9.0;

contract PubSubContract {
    struct Topic {
        string name;
        string[] messages;
        address[] publishers;
        address[] subscribers;
        mapping(address => string[]) subscriberToMessage;
        mapping(address => uint) subscriberToBalance;
    }

    mapping(string => Topic) public topics;
    string[] public topicNames;

    event MessageReceived(string topic, string message, address subscriber);


    modifier requireDeposit() {
        require(msg.value > 0 ether, "Deposit must be positive");
        _;
    }

    function advertise(string memory topicName) public {
        if (!topicExists(topicName)) {
            topics[topicName].name = topicName;
            topicNames.push(topicName);
        } 

        if (!contains(topics[topicName].publishers, msg.sender)) {
            topics[topicName].publishers.push(msg.sender);
        }
    }


    function subscribe(string memory topicName) public payable requireDeposit{
        require(topicExists(topicName), "Topic does not exist");
        topics[topicName].subscribers.push(msg.sender);
        topics[topicName].subscriberToBalance[msg.sender] += msg.value;
    }

    function publish(string memory topicName, string memory message) public {
        require(contains(topics[topicName].publishers, msg.sender), "Not authorized to publish");
        topics[topicName].messages.push(message);

        for (uint i = 0; i < topics[topicName].subscribers.length; i++) {
            address subscriber = topics[topicName].subscribers[i];
            if (topics[topicName].subscriberToBalance[subscriber] >= 0.005 ether) {
                topics[topicName].subscriberToBalance[subscriber] -= 0.005 ether;
                topics[topicName].subscriberToMessage[subscriber].push(message);

                emit MessageReceived(topicName, message, subscriber);
            } 

            // Check if the balance is now zero and remove the subscriber
            if (topics[topicName].subscriberToBalance[subscriber] == 0) {
                // Remove subscriber from the array
                removeSubscriber(topicName, subscriber);
            }
        }
    }

    // Helper function to remove a subscriber from the array
    function removeSubscriber(string memory topicName, address subscriber) internal {
        for (uint i = 0; i < topics[topicName].subscribers.length; i++) {
            if (topics[topicName].subscribers[i] == subscriber) {
                // Remove subscriber from the array
                delete topics[topicName].subscribers[i];

                // Shift the remaining elements to fill the gap
                for (uint j = i; j < topics[topicName].subscribers.length - 1; j++) {
                    topics[topicName].subscribers[j] = topics[topicName].subscribers[j + 1];
                }

                // Decrease the length of the array
                topics[topicName].subscribers.pop();

                break;
            }
        }
    }

    // Helper function to remove a subscriber from the array
    function removePublisher(string memory topicName, address publisher) internal {
        for (uint i = 0; i < topics[topicName].publishers.length; i++) {
            if (topics[topicName].publishers[i] == publisher) {
                // Remove subscriber from the array
                delete topics[topicName].publishers[i];

                // Shift the remaining elements to fill the gap
                for (uint j = i; j < topics[topicName].publishers.length - 1; j++) {
                    topics[topicName].publishers[j] = topics[topicName].publishers[j + 1];
                }

                // Decrease the length of the array
                topics[topicName].publishers.pop();

                break;
            }
        }
    }
    function unadvertise(string memory topicName) public {
        for (uint i = 0; i < topics[topicName].publishers.length; i++) {
            if (topics[topicName].publishers[i] == msg.sender) {
                removePublisher(topicName, msg.sender);
                break;
            }
        }
    }

    function unsubscribe(string memory topicName) public {
        require(topicExists(topicName), "Topic does not exist");
        require(contains(topics[topicName].subscribers, msg.sender), "Not subscribed to this topic");

        // Give back balance to subscriber
        uint remainingBalance = topics[topicName].subscriberToBalance[msg.sender];
        if (remainingBalance > 0) {
            payable(msg.sender).transfer(remainingBalance);
        }

        // Remove subscriber from the list
        for (uint i = 0; i < topics[topicName].subscribers.length; i++) {
            if (topics[topicName].subscribers[i] == msg.sender) {
                delete topics[topicName].subscribers[i];
                break;
            }
        }
    }

    // Helper function to check if an address is in an array
    function contains(address[] storage array, address element) internal view returns (bool) {
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == element) {
                return true;
            }
        }
        return false;
    }

    function topicExists(string memory topicName) internal view returns (bool) {
        for (uint i = 0; i < topicNames.length; i++) {
            if (keccak256(abi.encodePacked(topics[topicNames[i]].name)) == keccak256(abi.encodePacked(topicName))) {
                return true;
            }
        }
        return false;
    }

    // Add this function to your contract
    function printAllTopics() public view returns (string memory) {
        string memory result;

        for (uint i = 0; i < topicNames.length; i++) {
            result = string(abi.encodePacked(result, "Topic: ", topics[topicNames[i]].name, "\n"));

            // Print publishers
            result = string(abi.encodePacked(result, "Publishers: "));

            for (uint j = 0; j < topics[topicNames[i]].publishers.length; j++) {
                if (topics[topicNames[i]].publishers[j] != address(0)) {
                    result = string(abi.encodePacked(result, toAsciiString(topics[topicNames[i]].publishers[j]), " "));
                }
            }
            result = string(abi.encodePacked(result, "\n"));

            // Print subscribers
            result = string(abi.encodePacked(result, "Subscribers: "));
            for (uint k = 0; k < topics[topicNames[i]].subscribers.length; k++) {
                if (topics[topicNames[i]].subscribers[k] != address(0)) {
                    result = string(abi.encodePacked(result, toAsciiString(topics[topicNames[i]].subscribers[k]), " "));
                }
            }
            result = string(abi.encodePacked(result, "\n\n"));
        }

        return result;
    }

    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);            
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}
