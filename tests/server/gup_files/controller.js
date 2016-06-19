// constants
var STUDIO_DO_RESERVING = 1;
var STUDIO_UNDO_RESERVING = 2;
var STUDIO_EMAIL_ADDRESS_VALID = "valid";
var STUDIO_EMAIL_ADDRESS_DUPLICATED = "duplicated";
var STUDIO_EMAIL_ADDRESS_INVALID = "invalid";
var STUDIO_EMAIL_ADDRESS_NOT_FOUND = "notFound";

// messages
var STUDIO_MESSAGE_NO_GENDER = "性別をお選びください";
var STUDIO_MESSAGE_NO_AGE_GROUP = "年代をお選びください";
var STUDIO_MESSAGE_NO_EMAIL_ADDRESS = "メールアドレスをご入力ください";
var STUDIO_MESSAGE_DUPLICATED_EMAIL_ADDRESS = "メールアドレスが重複しています";
var STUDIO_MESSAGE_NOT_EVEN_TICKETS_FOR_COUPLE_50 = "夫婦50割引は、偶数の枚数のみお求めになれます";
var STUDIO_MESSAGE_INVALID_AGE_GROUP_FOR_COUPLE_50 = "夫婦50割引は、夫婦のどちらかが50歳以上でお求めになれます";
var STUDIO_MESSAGE_INVALID_GENDER_FOR_COUPLE_50 = "夫婦50割引の男性と女性の人数差があります";
var STUDIO_MESSAGE_UUID_INVALID = "エラーが発生しましたので、上映回選択から再度実行してください";
var STUDIO_MESSAGE_INVALID_EMAIL_ADDRESS = "未登録か無料会員、または無効なメールアドレスです";
var STUDIO_MESSAGE_NOT_KEPT_TICKET = "座席が確保できません";
var STUDIO_MESSAGE_LOGIN_FAILED = "ログインに失敗しました";
var STUDIO_MESSAGE_NETWORK_ERROR = "ネットワーク接続をご確認の後、再度実行してください";

// StudioController definition
var StudioController = function() {
    this.inquiry = null;
    this.ticketEntries = null;
    this.initialize();
};

StudioController.prototype.initialize = function() {
    var self = this;
    this.inquiry = new Inquiry();
    this.ticketEntries = new TicketEntries();
    _.each(tickets, function(ticket, seatName) {
        if (!ticket.available) {
            if (ticket.reserving) {
                $("#" + seatName + "_base").addClass("reserving");
            } else {
                $("#" + seatName + "_base").addClass("reserved");
            }
        }
    });
    if (inquiryRequest && inquiryRequest.programId == program.programId
            && _.size(inquiryRequest.entries) > 0) {
        joining = inquiryRequest.joining;
        _.each(inquiryRequest.entries, function(inquiryTicketEntry) {
            self.restoreTicket(inquiryTicketEntry);
        });
    }
    $("#movie-list").on("change", this, this.handleMovieListChange);
    $(".enable").on("click", this, this.handleSeatClick);
    $("#check-citizen").prop("checked", joining);
    $("#check-citizen").on("change", this, this.handleCheckCitizenChange);
    // $("#reset-seats").on("click", this, this.handleResetSeatsClick);
    $("#reserve-now-button").on("click", this, this.handleReserveNowClick);
    $("#be-a-member").on("click", this, this.handleRegistrationClick);
    $("#logout").on("click", this, this.handleLogoutClick);
};

StudioController.prototype.handleMovieListChange = function(event) {
    var index = this.selectedIndex;
    if (index != 0) {
        location.href = this.options[index].value;
    }
};

StudioController.prototype.handleSeatClick = function(event) {
    if (isAvailable()) {
        var self = event.data;
        var seatName = $(this).attr("id");
        self.switchTicketSelection(seatName);
    }
};

StudioController.prototype.handleCheckCitizenChange = function(event) {
    var self = event.data;
    joining = this.checked;
    _.each(self.ticketEntries.entries, function(ticketEntry) {
        ticketEntry.initialize(false);
        self.setTicketEntry(ticketEntry, true);
        if (!isAvailable()) {
            self.removeTicket(ticketEntry.seatName);
        }
    });
    self.displayTotal();
};

StudioController.prototype.handleResetSeatsClick = function(event) {
    var self = event.data;
    _.each(self.ticketEntries.entries, function(ticketEntry, seatName) {
        self.removeTicket(seatName);
    });
    self.displayTotal();
};

StudioController.prototype.handleReserveNowClick = function(event) {
    var self = event.data;
    self.hideErrorMessage();
    if (self.validateTicketEntries()) {
        lockScreen();
        self.postInquiryRequest(self.postLoginRequest,
                self.showInquiryErrorMessageForInquiryRequestFailed);
    }
};

StudioController.prototype.hideErrorMessage = function() {
    $("#login_error_message").text("");
    $("#inquiry_error_message").text("");
    registrationController.hideErrorMessage();
};

StudioController.prototype.postInquiryRequest = function(nextFunction,
        errorFunction) {
    var self = this;
    var url = common.contextPath + common.inquiryPath;
    var inquiryRequest = this.buildInquiryRequest();
    $.ajax({
        type : "POST",
        url : url,
        data : inquiryRequest,
        contentType : "application/json",
        dataType : "json",
        success : function(inquiryResponse) {
            if (inquiryResponse.success) {
                if (member.loggedIn) {
                    location.pathname = common.contextPath
                            + common.confirmationPath;
                } else if (nextFunction) {
                    nextFunction.call(self);
                }
            } else {
                if (errorFunction) {
                    errorFunction.call(self, inquiryResponse);
                }
                unlockScreen();
            }
        },
        error : function() {
            self.showInquiryErrorMessage(STUDIO_MESSAGE_NETWORK_ERROR);
            unlockScreen();
        }
    });
};

StudioController.prototype.showInquiryErrorMessage = function(message) {
    $("#inquiry_error_message").text(message);
    scrollTop("reserve-now");
};

StudioController.prototype.postLoginRequest = function() {
    var self = this;
    var url = common.contextPath + common.loginPath;
    var loginRequest = this.buildLoginRequest();
    $.ajax({
        type : "POST",
        url : url,
        data : loginRequest,
        contentType : "application/json",
        dataType : "text",
        success : function(loginResponse) {
            if (loginResponse == "succeeded") {
                if (self.validateOwnerEmailAddress()) {
                    location.pathname = common.contextPath
                            + common.confirmationPath;
                } else {
                    unlockScreen();
                }
            } else {
                self.showLoginErrorMessage(STUDIO_MESSAGE_LOGIN_FAILED);
                unlockScreen();
            }
        },
        error : function() {
            self.showLoginErrorMessage(STUDIO_MESSAGE_LOGIN_FAILED);
            unlockScreen();
        }
    });
};

StudioController.prototype.showInquiryErrorMessageForInquiryRequestFailed = function(
        inquiryResponse) {
    if (inquiryResponse.uuidValid) {
        this.setNotValidEmailAddressMessage(inquiryResponse);
        this.setTicketNotKeptMessage(inquiryResponse);
        this.saveKeptTickets(inquiryResponse);
    } else {
        this.showInquiryErrorMessage(STUDIO_MESSAGE_UUID_INVALID);
    }
};

StudioController.prototype.showLoginErrorMessage = function(message) {
    $("#login_error_message").text(message);
    scrollTop("reserve-now");
};

StudioController.prototype.handleRegistrationClick = function(event) {
    var self = event.data;
    self.hideErrorMessage();
    if (self.validateTicketEntries()) {
        if (registrationController.validate()) {
            lockScreen();
            self.postInquiryRequest(self.postRegistrationRequest,
                    self.showRegistrationErrorMessageForInquiryRequestFailed);
        }
    }
};

StudioController.prototype.handleLogoutClick = function(event) {
    var url = common.contextPath + common.logoutPath;
    $.ajax({
        type : "POST",
        url : url,
        success : function() {
            location.reload();
        }
    });
};

StudioController.prototype.postRegistrationRequest = function() {
    var self = this;
    var url = common.contextPath + common.registrationPath;
    var registrationRequest = registrationController
            .buildRegistrationRequest(member.uuid);
    $.ajax({
        type : "POST",
        url : url,
        data : registrationRequest,
        contentType : "application/json",
        dataType : "json",
        success : function(registrationResponse) {
            if (registrationResponse.success) {
                location.pathname = common.contextPath
                        + common.notificationPath;
            } else {
                registrationController
                        .showRegistrationResponseMessage(registrationResponse);
                unlockScreen();
            }
        },
        error : function() {
            registrationController.showRegistrationResponseMessage();
            unlockScreen();
        }
    });
};

StudioController.prototype.showRegistrationErrorMessageForInquiryRequestFailed = function(
        inquiryResponse) {
    if (inquiryResponse.uuidValid) {
        this.setNotValidEmailAddressMessage(inquiryResponse);
        this.setTicketNotKeptMessage(inquiryResponse);
        this.saveKeptTickets(inquiryResponse);
    } else {
        registrationController.showErrorMessage(STUDIO_MESSAGE_UUID_INVALID);
    }
};

StudioController.prototype.handleDeleteSeatClick = function(event) {
    var self = event.data;
    var ticketEntry = self.getTicketEntry(this.id);
    if (ticketEntry) {
        self.removeTicket(ticketEntry.seatName);
    }
};

StudioController.prototype.handleGenderChange = function(event) {
    var self = event.data;
    var ticketEntry = self.getTicketEntry(this.id);
    if (ticketEntry) {
        ticketEntry.genderCategoryId = toInt(this.value);
    }
};

StudioController.prototype.handleAgeGroupChange = function(event) {
    var self = event.data;
    var ticketEntry = self.getTicketEntry(this.id);
    if (ticketEntry) {
        ticketEntry.setAgeGroupCategoryId(toInt(this.value));
        self.setTicketEntry(ticketEntry, false);
        self.displayTotal();
    }
};

StudioController.prototype.handleTicketOptionChange = function(event) {
    var self = event.data;
    var ticketEntry = self.getTicketEntry(this.id);
    if (ticketEntry) {
        ticketEntry.ticketOptionId = toInt(this.value);
        self.setTicketEntry(ticketEntry, false);
        self.displayTotal();
    }
};

StudioController.prototype.handleDiscountChange = function(event) {
    var self = event.data;
    var ticketEntry = self.getTicketEntry(this.id);
    if (ticketEntry) {
        ticketEntry.discountId = toInt(this.value);
        self.setTicketEntry(ticketEntry, false);
        self.displayTotal();
    }
};

StudioController.prototype.handleEmailAddressChange = function(event) {
    var self = event.data;
    var ticketEntry = self.getTicketEntry(this.id);
    if (ticketEntry) {
        ticketEntry.emailAddress = this.value;
        self.setTicketEntry(ticketEntry, false);
        self.displayTotal();
    }
};

StudioController.prototype.switchTicketSelection = function(seatName) {
    if ($("#" + seatName + "_base").attr("class")) {
        this.removeTicket(seatName);
    } else {
        this.addTicket(seatName);
    }
};

StudioController.prototype.addTicket = function(seatName) {
    this.addTicketEntry(this.ticketEntries.add(seatName));
};

StudioController.prototype.restoreTicket = function(inquiryTicketEntry) {
    this.addTicketEntry(this.ticketEntries.restore(inquiryTicketEntry));
};

StudioController.prototype.addTicketEntry = function(ticketEntry) {
    if (ticketEntry) {
        if (!ticketEntry.owner) {
            this.cloneSeatElement(ticketEntry.seatName);
        }
        this.setTicketEntry(ticketEntry, true);
        $("#" + ticketEntry.seatName + "_base").addClass("seat-selected");
        this.displayTotal();
    }
};

StudioController.prototype.removeTicket = function(seatName) {
    var ticketEntry = this.ticketEntries.remove(seatName);
    if (ticketEntry) {
        this.unsetTicketEntry(ticketEntry);
        $("#" + seatName + "_base").removeClass("seat-selected");
        this.displayTotal();
    }
};

StudioController.prototype.cloneSeatElement = function(seatName) {
    var seatElement = $("#seat_owner").clone();
    $(seatElement).attr("id", "seat_" + seatName);
    this.renameAttr(seatElement, "delete_seat", seatName);
    this.renameAttr(seatElement, "seat_name", seatName);
    this.renameAttr(seatElement, "gender", seatName);
    this.renameAttr(seatElement, "age_group", seatName);
    this.renameAttr(seatElement, "ticket_option_block", seatName);
    this.renameAttr(seatElement, "ticket_option", seatName);
    this.renameAttr(seatElement, "discount", seatName);
    this.renameAttr(seatElement, "address_block", seatName);
    this.renameAttr(seatElement, "address", seatName);
    this.renameAttr(seatElement, "price", seatName);
    this.renameAttr(seatElement, "fee", seatName);
    this.renameAttr(seatElement, "error_message_block", seatName);
    $("#seats_block").append(seatElement);
};

StudioController.prototype.renameAttr = function(element, target, seatName) {
    $("#" + target + "_owner", element).attr("id", target + "_" + seatName);
};

StudioController.prototype.setTicketEntry = function(ticketEntry, setup) {
    var idSuffix = this.getIdSuffix(ticketEntry);
    if (setup) {
        $("#seat_name_" + idSuffix).text(ticketEntry.seatName);
        this.setDeleteSeat(idSuffix);
        this.setCategory(idSuffix, "gender", genderCategories,
                ticketEntry.genderCategoryId);
        this.setCategory(idSuffix, "age_group", ageGroupCategories,
                ticketEntry.ageGroupCategoryId);
        this.setTicketOption(idSuffix, ticketEntry.ticketOptionId);
        this.setEmailAddress(idSuffix, ticketEntry.getEmailAddress());
    }
    this.setDiscount(idSuffix, ticketEntry.discountId, setup);
    this.setPrice(idSuffix, ticketEntry.getPrice());
    this.setCreditFee(idSuffix, ticketEntry.getCreditFee());
    showElement("seat_" + idSuffix);
};

StudioController.prototype.setDeleteSeat = function(idSuffix) {
    var targetId = "delete_seat_" + idSuffix;
    $("#" + targetId).off("click");
    $("#" + targetId).on("click", this, this.handleDeleteSeatClick);
};

StudioController.prototype.setCategory = function(idSuffix, target, categories,
        selectedCategoryId) {
    var appendedClass = "appended_" + target + "_" + idSuffix;
    var targetId = target + "_" + idSuffix;
    $("#" + targetId).find("[class^='appended_" + target + "_']").remove();
    _.each(categories, function(category) {
        var selected = "";
        if (category.categoryId == selectedCategoryId) {
            selected = " selected";
        }
        var element = "<option value='" + category.categoryId + "' class='"
                + appendedClass + "'" + selected + ">" + category.categoryName
                + "</option>";
        $("#" + targetId).append(element);
    });
    $("#" + targetId).off("change");
    switch (target) {
    case "gender":
        $("#" + targetId).on("change", this, this.handleGenderChange);
        break;
    case "age_group":
        $("#" + targetId).on("change", this, this.handleAgeGroupChange);
        break;
    default:
        break;
    }
};

StudioController.prototype.setTicketOption = function(idSuffix,
        selectedTicketOptionId) {
    var appendedClass = "appended_ticket_option_" + idSuffix;
    var targetBlockId = "ticket_option_block_" + idSuffix;
    var targetId = "ticket_option_" + idSuffix;
    $("#" + targetId).find("[class^='appended_ticket_option_']").remove();
    if (ticketOptions.length) {
        _.each(ticketOptions, function(ticketOption) {
            var selected = "";
            if (ticketOption.ticketOptionId == selectedTicketOptionId) {
                selected = " selected";
            }
            var element = "<option value='" + ticketOption.ticketOptionId
                    + "' class='" + appendedClass + "'" + selected + ">"
                    + ticketOption.ticketOptionName + "</option>";
            $("#" + targetId).append(element);
        });
        showElement(targetBlockId);
        $("#" + targetId).off("change");
        $("#" + targetId).on("change", this, this.handleTicketOptionChange);
    } else {
        hideElement(targetBlockId);
    }
};

StudioController.prototype.setEmailAddress = function(idSuffix, emailAddress) {
    var targetId = "address_" + idSuffix;
    $("#" + targetId).val(emailAddress);
    $("#" + targetId).off("change");
    $("#" + targetId).on("change", this, this.handleEmailAddressChange);
};

StudioController.prototype.resetEmailAddress = function(idSuffix) {
    var targetId = "address_" + idSuffix;
    $("#" + targetId).val(null);
    var ticketEntry = this.getTicketEntry(targetId);
    if (ticketEntry) {
        ticketEntry.emailAddress = null;
    }
}

StudioController.prototype.setDiscount = function(idSuffix, selectedDiscountId,
        setup) {
    if (setup) {
        var appendedClass = "appended_discount_" + idSuffix;
        var targetId = "discount_" + idSuffix;
        $("#" + targetId).find("[class^='appended_discount_']").remove();
        var workDiscounts = asMember() ? discountsForMember
                : discountsForNonMember;
        _.each(workDiscounts, function(discount) {
            var selected = "";
            if (discount.discountId == selectedDiscountId) {
                selected = " selected";
            }
            var element = "<option value='" + discount.discountId + "' class='"
                    + appendedClass + "'" + selected + ">"
                    + discount.discountName + "</option>";
            $("#" + targetId).append(element);
        });
        $("#" + targetId).off("change");
        $("#" + targetId).on("change", this, this.handleDiscountChange);
    }
    var showEmailAddress = false;
    if (!this.isOwner(idSuffix) && asMember()) {
        if (selectedDiscountId == couple50Discount.discountId) {
            showEmailAddress = true;
        } else {
            if (selectedDiscountId) {
                _.find(discountsForMember, function(discount) {
                    if (discount.discountId == selectedDiscountId
                            && discount.memberOnly) {
                        showEmailAddress = true;
                        return true;
                    }
                });
            }
        }
    }
    if (showEmailAddress) {
        showElement("address_block_" + idSuffix);
    } else {
        hideElement("address_block_" + idSuffix);
        this.resetEmailAddress(idSuffix);
    }
};

StudioController.prototype.setPrice = function(idSuffix, price) {
    var targetId = "price_" + idSuffix;
    $("#" + targetId).text(price);
};

StudioController.prototype.setCreditFee = function(idSuffix, creditFee) {
    var targetId = "fee_" + idSuffix;
    $("#" + targetId).text(creditFee);
};

StudioController.prototype.unsetTicketEntry = function(ticketEntry) {
    var idSuffix = this.getIdSuffix(ticketEntry);
    var targetId = "seat_" + idSuffix;
    if (ticketEntry.owner) {
        hideElement(targetId);
        this.clearError(idSuffix);
    } else {
        $("#" + targetId).remove();
    }
    var newOwnerTicketEntry = this.ticketEntries.getOwner();
    if (newOwnerTicketEntry) {
        $("#seat_" + newOwnerTicketEntry.seatName).remove();
        this.setTicketEntry(newOwnerTicketEntry, true);
    }
};

StudioController.prototype.getTicketEntry = function(elementId) {
    try {
        var fields = elementId.split("_");
        var idSuffix = fields[fields.length - 1];
        return this.isOwner(idSuffix) ? this.ticketEntries.getOwner()
                : this.ticketEntries.get(idSuffix);
    } catch (e) {
        return null;
    }
};

StudioController.prototype.getIdSuffix = function(ticketEntry) {
    return ticketEntry.owner ? "owner" : ticketEntry.seatName;
};

StudioController.prototype.isOwner = function(idSuffix) {
    return idSuffix == "owner";
};

StudioController.prototype.displayTotal = function() {
    $("#sum_price").text(
            this.ticketEntries.getTotalPrice()
                    + this.ticketEntries.getTotalCreditFee());
    $("#sum_fee").text(this.ticketEntries.getTotalCreditFee());
    if (this.ticketEntries.size() > 0) {
        showElement("reserve-now");
    } else {
        hideElement("reserve-now");
    }
};

StudioController.prototype.setError = function(idSuffix, message) {
    var targetId = "error_message_block_" + idSuffix;
    var element = $("<div class='error-message'>" + message + "</div>");
    $("#" + targetId).append(element);
    scrollTop("seat_" + idSuffix);
};

StudioController.prototype.clearError = function(idSuffix) {
    var targetId = "error_message_block_" + idSuffix;
    $("#" + targetId).children().remove();
};

StudioController.prototype.validateTicketEntries = function() {
    var self = this;
    var result = true;
    var emailAddresses = {};
    _.find(this.ticketEntries.entries, function(ticketEntry) {
        var idSuffix = self.getIdSuffix(ticketEntry);
        self.clearError(idSuffix);
        if (!ticketEntry.validateGender()) {
            self.setError(idSuffix, STUDIO_MESSAGE_NO_GENDER);
            result = false;
            return true;
        } else if (!ticketEntry.validateAgeGroup()) {
            self.setError(idSuffix, STUDIO_MESSAGE_NO_AGE_GROUP);
            result = false;
            return true;
        } else if (!ticketEntry.validateEmailAddress()) {
            self.setError(idSuffix, STUDIO_MESSAGE_NO_EMAIL_ADDRESS);
            result = false;
            return true;
        }
        var emailAddress = ticketEntry.getEmailAddress();
        if (emailAddress) {
            if (emailAddresses[emailAddress]) {
                self
                        .setError(idSuffix,
                                STUDIO_MESSAGE_DUPLICATED_EMAIL_ADDRESS);
                result = false;
                return true;
            }
            emailAddresses[emailAddress] = true;
        }
    });
    if (result) {
        var numOfCouple50 = 0;
        var numOfAgeGroup = 0;
        var numOfMale = 0;
        var ageGroupCategoryIds = {};
        _.each(couple50Discount.ageGroupCategoryIds, function(
                ageGroupCategoryId) {
            ageGroupCategoryIds[ageGroupCategoryId] = true;
        });
        var maleCategoryId = 0;
        _.find(genderCategories, function(genderCategory) {
            if (genderCategory.gender) {
                maleCategoryId = genderCategory.categoryId;
                return true;
            }
        });
        _.each(this.ticketEntries.entries, function(ticketEntry) {
            if (ticketEntry.discountId == couple50Discount.discountId) {
                numOfCouple50++;
                if (ageGroupCategoryIds[ticketEntry.ageGroupCategoryId]) {
                    numOfAgeGroup++;
                }
                if (ticketEntry.genderCategoryId == maleCategoryId) {
                    numOfMale++;
                }
            }
        });
        if (numOfCouple50 % 2 != 0) {
            self
                    .showInquiryErrorMessage(STUDIO_MESSAGE_NOT_EVEN_TICKETS_FOR_COUPLE_50);
            result = false;
        } else if (numOfCouple50 / 2 > numOfAgeGroup) {
            self
                    .showInquiryErrorMessage(STUDIO_MESSAGE_INVALID_AGE_GROUP_FOR_COUPLE_50);
            result = false;
        } else if (numOfCouple50 / 2 != numOfMale) {
            self
                    .showInquiryErrorMessage(STUDIO_MESSAGE_INVALID_GENDER_FOR_COUPLE_50);
            result = false;
        }
    }
    return result;
};

StudioController.prototype.buildLoginRequest = function() {
    var loginRequest = {
        emailAddress : $("#login_email_address").val(),
        password : encrypt($("#login_password").val(), member.uuid)
    };
    return JSON.stringify(loginRequest);
};

StudioController.prototype.validateOwnerEmailAddress = function() {
    var self = this;
    var ownerEmailAddress = $("#login_email_address").val();
    var result = true;
    _.find(this.ticketEntries.entries, function(ticketEntry) {
        if (!ticketEntry.owner) {
            var emailAddress = ticketEntry.getEmailAddress();
            if (emailAddress && emailAddress == ownerEmailAddress) {
                self.setError(self.getIdSuffix(ticketEntry),
                        STUDIO_MESSAGE_DUPLICATED_EMAIL_ADDRESS);
                result = false;
                return true;
            }
        }
    });
    return result;
};

StudioController.prototype.buildInquiryRequest = function() {
    var inquiryRequest = new InquiryRequest();
    inquiryRequest.uuid = member.uuid;
    inquiryRequest.joining = joining;
    if (!joining && defaultDiscountForMember) {
        inquiryRequest.discountIdIfMember = defaultDiscountForMember.discountId;
    }
    inquiryRequest.movieId = program.movieId;
    inquiryRequest.programId = program.programId;
    this.inquiry.setInquiryTicketEntries(this.ticketEntries.entries);
    this.inquiry.mergeInquiryTicketEntries();
    inquiryRequest.entries = this.inquiry.entries;
    return JSON.stringify(inquiryRequest);
};

StudioController.prototype.setNotValidEmailAddressMessage = function(
        inquiryResponse) {
    if (inquiryResponse.numOfDuplicatedEmailAddresses
            || inquiryResponse.numOfInvalidEmailAddresses
            || inquiryResponse.numOfNotFoundEmailAddreses) {
        var self = this;
        _.each(inquiryResponse.emailAddresses, function(status, emailAddress) {
            if (status != STUDIO_EMAIL_ADDRESS_VALID) {
                var ticketEntry = self.ticketEntries
                        .findByEmailAddress(emailAddress);
                if (ticketEntry) {
                    if (status == STUDIO_EMAIL_ADDRESS_DUPLICATED) {
                        self.setError(self.getIdSuffix(ticketEntry),
                                STUDIO_MESSAGE_DUPLICATED_EMAIL_ADDRESS);
                    } else {
                        self.setError(self.getIdSuffix(ticketEntry),
                                STUDIO_MESSAGE_INVALID_EMAIL_ADDRESS);
                    }
                }
            }
        });
    }
};

StudioController.prototype.setTicketNotKeptMessage = function(inquiryResponse) {
    if (inquiryResponse.numOfNotKeptTicketIds) {
        var self = this;
        _
                .each(
                        self.inquiry.entries,
                        function(inquiryTicketEntry) {
                            if (inquiryTicketEntry.isDoReserving()
                                    && !inquiryResponse.ticketIds[inquiryTicketEntry.ticketId]) {
                                var ticketEntry = self.ticketEntries
                                        .findByTicketId(inquiryTicketEntry.ticketId);
                                if (ticketEntry) {
                                    self.setError(
                                            self.getIdSuffix(ticketEntry),
                                            STUDIO_MESSAGE_NOT_KEPT_TICKET);
                                }
                            }
                        });
    }
};

StudioController.prototype.saveKeptTickets = function(inquiryResponse) {
    var keptSeatNames = [];
    if (inquiryResponse.numOfKeptTicketIds) {
        var self = this;
        _.each(inquiryResponse.ticketIds, function(success, ticketId) {
            if (success) {
                var ticketEntry = self.ticketEntries.findByTicketId(ticketId);
                if (ticketEntry) {
                    keptSeatNames.push(ticketEntry.seatName);
                }
            }
        });
    }
    this.inquiry.saveKeptInquiryTicketEntries(keptSeatNames);
};
