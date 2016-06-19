// RegistrationRequest definition
var RegistrationRequest = function() {
    this.uuid = null;
    this.firstName = null;
    this.firstNameKana = null;
    this.lastName = null;
    this.lastNameKana = null;
    this.birthday = 0;
    this.male = false;
    this.phoneNumber = null;
    this.emailAddress = null;
    this.zipCode = null;
    this.address1 = null;
    this.address2 = null;
    this.address3 = null;
    this.password = null;
    this.autoRenewal = false;
};

RegistrationRequest.prototype.log = function() {
    console.log("*** RegistrationRequest ***");
    console.log("uuid=" + this.uuid);
    console.log("firstName=" + this.firstName);
    console.log("firstNameKana=" + this.firstNameKana);
    console.log("lastName=" + this.lastName);
    console.log("lastNameKana=" + this.lastNameKana);
    console.log("birthday=" + this.birthday);
    console.log("male=" + this.male);
    console.log("phoneNumber=" + this.phoneNumber);
    console.log("emailAddress=" + this.emailAddress);
    console.log("zipCode=" + this.zipCode);
    console.log("address1=" + this.address1);
    console.log("address2=" + this.address2);
    console.log("address3=" + this.address3);
    console.log("password=" + this.password);
    console.log("autoRenewal=" + this.autoRenewal);
};
