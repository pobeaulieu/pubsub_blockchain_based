pragma solidity >=0.5.1;

contract StudentContract {
    uint public studentNumber;
    address public student;
    mapping(address => uint) public studentToStudentNumber;

    // Event emitted when a student number is updated
    event StudentNumberUpdated(uint newStudentNumber, address studentAddress);

    constructor() public {
        student = msg.sender;
        studentToStudentNumber[student] = 0;
    }

    // Modifier to require a specific amount of Wei
    modifier requirePayment() {
        require(msg.value == 5400000000000000, "Sent amount must be 0.0054 ether");
        _;
    }

    function setStudentNumber(uint _studentNumber) public payable requirePayment {
        // Update the student number and emit an event
        studentNumber = _studentNumber;
        studentToStudentNumber[student] = _studentNumber;
        emit StudentNumberUpdated(_studentNumber, student);
    }

    function getStudentNumber() public view returns (uint) {
        return studentToStudentNumber[student];
    }
}
