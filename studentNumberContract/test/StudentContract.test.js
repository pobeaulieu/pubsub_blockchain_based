const StudentContract = artifacts.require('StudentContract');

contract('StudentContract', (accounts) => {
  const owner = accounts[0];

  it('should set and get student number', async () => {
    const studentContract = await StudentContract.new({ from: owner });
    const payment = 5400000000000000
    const newStudentNumber = 45;
    const newStudentNumber2 = 26;

    // Set student number
    await studentContract.setStudentNumber(newStudentNumber, { from: owner, value: payment });
    // console.log("Setting Student Number to :" + newStudentNumber + " (with payment of " + payment + "Wei)")
    // Get student number
    const retrievedStudentNumber = await studentContract.getStudentNumber({ from: owner });
    // console.log("Retrieved Student Number is : " + retrievedStudentNumber)

    assert.equal(retrievedStudentNumber, newStudentNumber, 'Student number not set correctly');

    // Set student number
    await studentContract.setStudentNumber(newStudentNumber2, { from: owner, value: payment });
    // console.log("Setting Student Number to :" + newStudentNumber2 + " (with payment of " + payment + "Wei)")
    // Get student number
    const retrievedStudentNumber2 = await studentContract.getStudentNumber({ from: owner });
    // console.log("Retrieved Student Number is : " + retrievedStudentNumber2)

    assert.equal(retrievedStudentNumber2, newStudentNumber2, 'Student number not set correctly');
  });

  it('should reject non-payment', async () => {
    const studentContract = await StudentContract.new({ from: owner });

    const newStudentNumber = 456;

    // Try to set student number without sending the required payment
    try {
      await studentContract.setStudentNumber(newStudentNumber, { from: owner });
    } catch (error) {
        // console.log(error)
        assert(error.message.includes('Sent amount must be 0.0054 ether'), 'Expected payment error');
      return;
    }

    assert.fail('Expected an error but none was encountered');
  });
});
