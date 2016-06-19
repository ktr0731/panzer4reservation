// constants
var REGISTRATION_REGISTRATION_SUCCEEDED = 0;
var REGISTRATION_REGISTRATION_DUPLICATION_EMAIL_ADDRESS = 1;
var REGISTRATION_REGISTRATION_FAILED = 2;

var REGISTRATION_MIN_PASSWORD_LENGTH = 4;
var REGISTRATION_MAX_PASSWORD_LENGTH = 16;

var REGISTRATION_MEMBERSHIP_TYPE_MEMBER = "シネマシティズン会員";
var REGISTRATION_MEMBERSHIP_TYPE_NON_MEMBER = "無料会員";

// messages
var REGISTRATION_MESSAGE_UPDATE_CONFIRMATION = "会員情報を更新しますか？";
var REGISTRATION_MESSAGE_REGISTRATION_DESCRIPTION = "シネマシティWeb予約のための会員登録を行います。<br />以下のフォームに必要な情報を入力してください。<br />登録完了メールを、入力されたメールアドレスに送信いたします。<br />受信拒否や指定受信などの設定をされていると、配信されるメールが受け取れない場合がありますので、メールに携帯電話のメールアドレスをご利用になる場合、設定をお願いいたします。";
var REGISTRATION_MESSAGE_UPDATE_DESCRIPTION = "登録情報の更新をご希望の方は、フォームにご入力の上「更新」ボタンをクリックして下さい。";
var REGISTRATION_MESSAGE_NO_LAST_NAME = "お名前(漢字)姓をご入力ください";
var REGISTRATION_MESSAGE_NO_FIRST_NAME = "お名前(漢字)名をご入力ください";
var REGISTRATION_MESSAGE_NO_LAST_NAME_KANA = "お名前(カナ)姓をご入力ください";
var REGISTRATION_MESSAGE_NO_FIRST_NAME_KANA = "お名前(カナ)名をご入力ください";
var REGISTRATION_MESSAGE_NO_ZIP_CODE = "郵便番号をご入力ください";
var REGISTRATION_MESSAGE_INVALID_ZIP_CODE = "正しい郵便番号をご入力ください";
var REGISTRATION_MESSAGE_NO_ADDRESS2 = "市区町村をご入力ください";
var REGISTRATION_MESSAGE_NO_ADDRESS3 = "番地をご入力ください";
var REGISTRATION_MESSAGE_NO_PHONE_NUMBER = "電話番号をご入力ください";
var REGISTRATION_MESSAGE_INVALID_PHONE_NUMBER = "正しい電話番号をご入力ください";
var REGISTRATION_MESSAGE_NO_BIRTHDAY = "正しい生年月日をご入力ください";
var REGISTRATION_MESSAGE_NO_EMAIL_ADDRESS = "メールアドレスをご入力ください";
var REGISTRATION_MESSAGE_INVALID_EMAIL_ADDRESS = "正しいメールアドレスをご入力ください";
var REGISTRATION_MESSAGE_UNMATCH_EMAIL_ADDRESS = "メールアドレスが一致しません";
var REGISTRATION_MESSAGE_NO_PASSWORD = "パスワードをご入力ください";
var REGISTRATION_MESSAGE_INVALID_PASSWORD = "正しいパスワードをご入力ください";
var REGISTRATION_MESSAGE_UNMATCH_PASSWORD = "パスワードが一致しません";
var REGISTRATION_MESSAGE_DUPLICATED_EMAIL_ADDRESS = "メールアドレスが既に使用されています";
var REGISTRATION_MESSAGE_REGISTRATION_FAILED = "会員登録に失敗しました";
var REGISTRATION_MESSAGE_UPDATE_FAILED = "登録情報変更に失敗しました";
var REGISTRATION_MESSAGE_NETWORK_ERROR = "ネットワーク接続をご確認の後、再度実行してください";

// RegistrationController definition
var RegistrationController = function(enableHandler) {
    this.initialize(enableHandler);
};

RegistrationController.prototype.initialize = function(enableHandler) {
    $("#zipCode").on("change", this, this.handleZipCodeChange);
    $("#registration_reset_button").on("click", this,
            this.handleRegistrationResetClick);
    $("#agreement").on("change", this, this.handleAgreementChange);
    if (enableHandler) {
        $("#be-a-member").on("click", this, this.handleRegistrationClick);
        $("#update_member").on("click", this, this.handleUpdateClick);
    }
};

RegistrationController.prototype.setupForRegistration = function() {
    $("#description_text").html(REGISTRATION_MESSAGE_REGISTRATION_DESCRIPTION);
    registrationController.setMemberStatusVisible(false);
    registrationController.setCitizenVisible(false);
    registrationController.setPasswordVisible(true);
    registrationController.setUserPolicyVisible(true);
};

RegistrationController.prototype.setupForUpdate = function() {
    $("#description_text").html(REGISTRATION_MESSAGE_UPDATE_DESCRIPTION);
    registrationController.setMemberStatusVisible(true);
    registrationController.setCitizenVisible(true);
    registrationController.setPasswordVisible(false);
    registrationController.setUserPolicyVisible(false);
};

RegistrationController.prototype.isMemberStatusVisible = function() {
    return isElementVisible("member_status_block");
};

RegistrationController.prototype.setMemberStatusVisible = function(visible) {
    if (visible) {
        showElement("member_status_block");
        if (member.valid) {
            showElement("membership_duedate_block");
        } else {
            hideElement("membership_duedate_block");
        }
    } else {
        hideElement("member_status_block");
        hideElement("membership_duedate_block");
    }
};

RegistrationController.prototype.isCitizenVisible = function() {
    return isElementVisible("citizen_block");
};

RegistrationController.prototype.setCitizenVisible = function(visible) {
    if (visible && member.valid) {
        showElement("citizen_block");
    } else {
        hideElement("citizen_block");
    }
};

RegistrationController.prototype.isPasswordVisible = function() {
    return isElementVisible("password_block");
};

RegistrationController.prototype.setPasswordVisible = function(visible) {
    if (visible) {
        showElement("password_block");
        showElement("password_confirmation_block");
    } else {
        hideElement("password_block");
        hideElement("password_confirmation_block");
    }
};

RegistrationController.prototype.isUserPolicyVisible = function() {
    return isElementVisible("user_policy_block");
};

RegistrationController.prototype.setUserPolicyVisible = function(visible) {
    if (visible) {
        showElement("user_policy_block");
    } else {
        hideElement("user_policy_block");
    }
};

RegistrationController.prototype.handleZipCodeChange = function(event) {
    searchZipCode($("#zipCode").val(), function(data) {
        $("#address1").val(data.state);
        $('#address2').val(data.city + data.street);
    });
};

RegistrationController.prototype.handleRegistrationResetClick = function(event) {
    var self = event.data;
    self.reset();
};

RegistrationController.prototype.postRegistrationRequest = function(
        nextFunction) {
    var self = this;
    var url = common.contextPath + common.registrationPath;
    var registrationRequest = this.buildRegistrationRequest(common.uuid);
    $
            .ajax({
                type : "POST",
                url : url,
                data : registrationRequest,
                contentType : "application/json",
                dataType : "json",
                success : function(registrationResponse) {
                    if (registrationResponse.success) {
                        hideElement("registration_block");
                        showElement("registration_completed_block");
                    } else {
                        if (registrationResponse.status == REGISTRATION_REGISTRATION_DUPLICATION_EMAIL_ADDRESS) {
                            self
                                    .showErrorMessage(REGISTRATION_MESSAGE_DUPLICATED_EMAIL_ADDRESS);
                        } else {
                            self
                                    .showErrorMessage(REGISTRATION_MESSAGE_REGISTRATION_FAILED);
                        }
                    }
                },
                error : function() {
                    self.showErrorMessage(REGISTRATION_MESSAGE_NETWORK_ERROR);
                },
                complete : function() {
                    unlockScreen();
                }
            });
};

RegistrationController.prototype.handleAgreementChange = function(event) {
    var self = event.data;
    self.setRegistrationButton();
};

RegistrationController.prototype.handleRegistrationClick = function(event) {
    var self = event.data;
    self.hideErrorMessage();
    if (self.validate()) {
        lockScreen();
        self.postRegistrationRequest();
    }
};

RegistrationController.prototype.postRegistrationRequest = function() {
    var self = this;
    var url = common.contextPath + common.registrationPath;
    var registrationRequest = self.buildRegistrationRequest(common.uuid);
    $.ajax({
        type : "POST",
        url : url,
        data : registrationRequest,
        contentType : "application/json",
        dataType : "json",
        success : function(registrationResponse) {
            if (registrationResponse.success) {
                location.pathname = common.contextPath
                        + common.registrationNotificationPath;
            } else {
                self.showRegistrationResponseMessage(registrationResponse);
                unlockScreen();
            }
        },
        error : function() {
            self.showRegistrationResponseMessage();
            unlockScreen();
        }
    });
};

RegistrationController.prototype.handleUpdateClick = function(event) {
    var self = event.data;
    self.hideErrorMessage();
    if (confirm(REGISTRATION_MESSAGE_UPDATE_CONFIRMATION)) {
        if (self.validate()) {
            lockScreen();
            self.postUpdateRequest();
        }
    }
};

RegistrationController.prototype.postUpdateRequest = function() {
    var self = this;
    var url = common.contextPath + common.updatePath;
    var registrationRequest = self.buildRegistrationRequest(common.uuid);
    $.ajax({
        type : "POST",
        url : url,
        data : registrationRequest,
        contentType : "application/json",
        dataType : "json",
        success : function(registrationResponse) {
            if (registrationResponse.success) {
                location.pathname = common.contextPath
                        + common.updateNotificationPath;
            } else {
                self.showRegistrationResponseMessage(registrationResponse);
                unlockScreen();
            }
        },
        error : function() {
            self.showRegistrationResponseMessage();
            unlockScreen();
        }
    });
};

RegistrationController.prototype.reset = function() {
    if (this.isPasswordVisible()) {
        $("#member_status").text(null);
        $("#membership_duedate").text(null);
        $("#lastName").val(null);
        $("#firstName").val(null);
        $("#lastNameKana").val(null);
        $("#firstNameKana").val(null);
        $("#zipCode").val(null);
        $("#address1").val("13");
        $("#address2").val(null);
        $("#address3").val(null);
        $("#phoneNumber").val(null);
        $("#gender_male").prop("checked", true);
        $("#birthday_year").val(null);
        $("#birthday_month").val(null);
        $("#birthday_date").val(null);
        $("#emailAddress").val(null);
        $("#emailAddress_confirm").val(null);
        $("#citizen_auto_renewal").prop("checked", true);
    } else {
        $("#member_status").text(
                member.valid ? REGISTRATION_MEMBERSHIP_TYPE_MEMBER
                        : REGISTRATION_MEMBERSHIP_TYPE_NON_MEMBER);
        $("#membership_duedate").text(member.membershipDueDateString);
        $("#lastName").val(member.lastName);
        $("#firstName").val(member.firstName);
        $("#lastNameKana").val(member.lastNameKana);
        $("#firstNameKana").val(member.firstNameKana);
        $("#zipCode").val(member.zipCode);
        $('#address1 option').filter(function(index) {
            return $(this).text() == member.address1;
        }).prop('selected', true);
        $("#address2").val(member.address2);
        $("#address3").val(member.address3);
        $("#phoneNumber").val(member.phoneNumber);
        $("#gender_male").prop("checked", member.male);
        $("#birthday_year").val(member.birthdayYear);
        $("#birthday_month").val(member.birthdayMonth);
        $("#birthday_date").val(member.birthdayDate);
        $("#emailAddress").val(member.emailAddress);
        $("#emailAddress_confirm").val(member.emailAddress);
        $("#citizen_auto_renewal").prop("checked", member.autoRenewal);
    }
    $("#password").val(null);
    $("#password_confirm").val(null);
    this.hideErrorMessage();
};

RegistrationController.prototype.validate = function() {
    var errorMessage = null;
    var zipCode = $("#zipCode").val();
    var phoneNumber = $("#phoneNumber").val();
    var birthday_year = toInt($("#birthday_year").val());
    var birthday_month = toInt($("#birthday_month").val());
    var birthday_date = toInt($("#birthday_date").val());
    var emailAddress = $("#emailAddress").val();
    var password = $("#password").val();
    if (!$("#lastName").val()) {
        errorMessage = REGISTRATION_MESSAGE_NO_LAST_NAME;
    } else if (!$("#firstName").val()) {
        errorMessage = REGISTRATION_MESSAGE_NO_FIRST_NAME;
    } else if (!$("#lastNameKana").val()) {
        errorMessage = REGISTRATION_MESSAGE_NO_LAST_NAME_KANA;
    } else if (!$("#firstNameKana").val()) {
        errorMessage = REGISTRATION_MESSAGE_NO_FIRST_NAME_KANA;
    } else if (!zipCode) {
        errorMessage = REGISTRATION_MESSAGE_NO_ZIP_CODE;
    } else if (zipCode.match(/[^0-9]/)) {
        errorMessage = REGISTRATION_MESSAGE_INVALID_ZIP_CODE;
    } else if (!$("#address2").val()) {
        errorMessage = REGISTRATION_MESSAGE_NO_ADDRESS2;
    } else if (!$("#address3").val()) {
        errorMessage = REGISTRATION_MESSAGE_NO_ADDRESS3;
    } else if (!phoneNumber) {
        errorMessage = REGISTRATION_MESSAGE_NO_PHONE_NUMBER;
    } else if (phoneNumber.match(/[^0-9]/)) {
        errorMessage = REGISTRATION_MESSAGE_INVALID_PHONE_NUMBER;
    } else if (birthday_year < 1900) {
        $("#birthday_year").val(null);
        errorMessage = REGISTRATION_MESSAGE_NO_BIRTHDAY;
    } else if (birthday_month < 1 || birthday_month > 12) {
        $("#birthday_month").val(null);
        errorMessage = REGISTRATION_MESSAGE_NO_BIRTHDAY;
    } else if (birthday_month < 1 || birthday_month > 31) {
        $("#birthday_date").val(null);
        errorMessage = REGISTRATION_MESSAGE_NO_BIRTHDAY;
    } else if (!validateDate(birthday_year, birthday_month, birthday_date)) {
        errorMessage = REGISTRATION_MESSAGE_NO_BIRTHDAY;
    } else if (new Date().getTime() < new Date(birthday_year, birthday_month,
            birthday_date).getTime()) {
        errorMessage = REGISTRATION_MESSAGE_NO_BIRTHDAY;
    } else if (!emailAddress) {
        errorMessage = REGISTRATION_MESSAGE_NO_EMAIL_ADDRESS;
    } else if (!emailAddress
            .match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
        errorMessage = REGISTRATION_MESSAGE_INVALID_EMAIL_ADDRESS;
    } else if ($("#emailAddress_confirm").val() != emailAddress) {
        errorMessage = REGISTRATION_MESSAGE_UNMATCH_EMAIL_ADDRESS;
    } else if (this.isPasswordVisible()) {
        if (!password) {
            errorMessage = REGISTRATION_MESSAGE_NO_PASSWORD;
        } else if (password.match(/[^a-zA-Z0-9]/)) {
            errorMessage = REGISTRATION_MESSAGE_INVALID_PASSWORD;
        } else if (!password.match(/[a-zA-Z]/) || !password.match(/[0-9]/)) {
            errorMessage = REGISTRATION_MESSAGE_INVALID_PASSWORD;
        } else if (password.length < REGISTRATION_MIN_PASSWORD_LENGTH
                || password.length > REGISTRATION_MAX_PASSWORD_LENGTH) {
            errorMessage = REGISTRATION_MESSAGE_INVALID_PASSWORD;
        } else if ($("#password_confirm").val() != password) {
            errorMessage = REGISTRATION_MESSAGE_UNMATCH_PASSWORD;
        }
    }
    if (errorMessage) {
        this.showErrorMessage(errorMessage);
        return false;
    } else {
        this.hideErrorMessage();
        return true;
    }
};

RegistrationController.prototype.showErrorMessage = function(errorMessage) {
    $("#registration_error_message").text(errorMessage);
    showElement("registration_error_block");
    scrollBottom("registration_error_message");
};

RegistrationController.prototype.hideErrorMessage = function() {
    hideElement("registration_error_block");
    $("#registration_error_message").text("");
};

RegistrationController.prototype.buildRegistrationRequest = function(uuid) {
    var registrationRequest = new RegistrationRequest();
    registrationRequest.uuid = uuid;
    registrationRequest.lastName = $("#lastName").val();
    registrationRequest.firstName = $("#firstName").val();
    registrationRequest.lastNameKana = $("#lastNameKana").val();
    registrationRequest.firstNameKana = $("#firstNameKana").val();
    registrationRequest.zipCode = $("#zipCode").val();
    registrationRequest.address1 = $("#address1 option:selected").text();
    registrationRequest.address2 = $("#address2").val();
    registrationRequest.address3 = $("#address3").val();
    registrationRequest.phoneNumber = $("#phoneNumber").val();
    registrationRequest.male = $("#gender_male").prop("checked");
    registrationRequest.birthday = new Date($("#birthday_year").val(), $(
            "#birthday_month").val() - 1, $("#birthday_date").val()).getTime();
    registrationRequest.emailAddress = $("#emailAddress").val();
    if (this.isPasswordVisible()) {
        registrationRequest.password = encrypt($("#password").val(), uuid);
    } else {
        registrationRequest.autoRenewal = $("#citizen_auto_renewal").prop(
                "checked");
    }
    return JSON.stringify(registrationRequest);
};

RegistrationController.prototype.showRegistrationResponseMessage = function(
        registrationResponse) {
    if (registrationResponse) {
        if (registrationResponse.status == REGISTRATION_REGISTRATION_DUPLICATION_EMAIL_ADDRESS) {
            this
                    .showErrorMessage(REGISTRATION_MESSAGE_DUPLICATED_EMAIL_ADDRESS);
        } else {
            this
                    .showErrorMessage(this.isPasswordVisible() ? REGISTRATION_MESSAGE_REGISTRATION_FAILED
                            : REGISTRATION_MESSAGE_UPDATE_FAILED);
        }
    } else {
        this.showErrorMessage(REGISTRATION_MESSAGE_NETWORK_ERROR);
    }
};

RegistrationController.prototype.setRegistrationButton = function() {
    if ($("#agreement").prop("checked")) {
        showElement("be-a-member");
        scrollTop("be-a-member");
    } else {
        hideElement("be-a-member");
    }
};
