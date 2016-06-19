// Inquiry definition
var Inquiry = function() {
    this.entries = null; // [InquiryTicketEntry]
    this.keptEntries = null; // kept entries
};

Inquiry.prototype.log = function() {
    console.log("*** Inquiry ***");
    console.log("* entries *");
    _.each(this.entries, function(inquiryTicketEntry) {
        console.log(inquiryTicketEntry);
    });
    console.log("* keptEntries *");
    _.each(this.keptEntries, function(inquiryTicketEntry) {
        console.log(inquiryTicketEntry);
    });
};

Inquiry.prototype.setInquiryTicketEntries = function(ticketEntries) {
    var self = this;
    this.entries = [];
    _.each(ticketEntries, function(ticketEntry) {
        self.entries.push(new InquiryTicketEntry(ticketEntry));
    });
};

Inquiry.prototype.mergeInquiryTicketEntries = function() {
    var self = this;
    _.each(this.keptEntries, function(keptInquiryTicketEntry) {
        var found = false;
        _.find(self.entries, function(inquiryTicketEntry) {
            if (inquiryTicketEntry.matches(keptInquiryTicketEntry)) {
                found = true;
                return true;
            }
        });
        if (!found) {
            keptInquiryTicketEntry.ticketStatus = STUDIO_UNDO_RESERVING;
            self.entries.push(keptInquiryTicketEntry);
        }
    });
};

Inquiry.prototype.saveKeptInquiryTicketEntries = function(keptSeatNames) {
    var self = this;
    this.keptEntries = [];
    _.each(this.entries, function(inquiryTicketEntry) {
        if (inquiryTicketEntry.isDoReserving()
                && _.contains(keptSeatNames, inquiryTicketEntry.seatName)) {
            self.keptEntries.push(inquiryTicketEntry);
        }
    });
    this.entries = [];
};

// InquiryRequest definition
var InquiryRequest = function() {
    this.uuid = null;
    this.joining = false;
    this.discountIdIfMember = 0;
    this.movieId = 0;
    this.programId = 0;
    this.entries = null; // [InquiryTicketEntry]
};

InquiryRequest.prototype.log = function() {
    console.log("*** InquiryRequest ***");
    console.log("uuid=" + this.uuid);
    console.log("joining=" + this.joining);
    console.log("discountIdIfMember=" + this.discountIdIfMember);
    console.log("movieId=" + this.movieId);
    console.log("programId=" + this.programId);
    _.each(this.entries, function(inquiryTicketEntry) {
        inquiryTicketEntry.log();
    });
};

InquiryRequest.prototype.getOwner = function() {
    return _.find(this.entries, function(inquiryTicketEntry) {
        if (inquiryTicketEntry.owner) {
            return true;
        }
    });
};

// InquiryTicketEntry definition
var InquiryTicketEntry = function(ticketEntry) {
    this.seatName = ticketEntry.seatName;
    this.ticketId = ticketEntry.ticketId;
    this.seatId = ticketEntry.seatId;
    this.owner = ticketEntry.owner;
    this.emailAddress = ticketEntry.getEmailAddress();
    this.genderCategoryId = ticketEntry.genderCategoryId;
    this.ageGroupCategoryId = ticketEntry.ageGroupCategoryId;
    this.ticketTypeId = ticketEntry.ticketTypeId;
    this.ticketOptionId = ticketEntry.ticketOptionId;
    this.discountId = ticketEntry.discountId;
    this.price = ticketEntry.getPrice();
    this.creditFee = ticketEntry.getCreditFee();
    this.ticketStatus = STUDIO_DO_RESERVING;
};

InquiryTicketEntry.prototype.log = function() {
    console.log("*** InquiryTicketEntry ***");
    console.log("seatName=" + this.seatName);
    console.log("ticketId=" + this.ticketId);
    console.log("seatId=" + this.seatId);
    console.log("owner=" + this.owner);
    console.log("emailAddress=" + this.emailAddress);
    console.log("genderCategoryId=" + this.genderCategoryId);
    console.log("ageGroupCategoryId=" + this.ageGroupCategoryId);
    console.log("ticketTypeId=" + this.ticketTypeId);
    console.log("ticketOptionId=" + this.ticketOptionId);
    console.log("discountId=" + this.discountId);
    console.log("price=" + this.price);
    console.log("creditFee=" + this.creditFee);
    console.log("ticketStatus=" + this.ticketStatus);
};

InquiryTicketEntry.prototype.matches = function(otherInquiryTicketEntry) {
    return this.seatName == otherInquiryTicketEntry.seatName;
};

InquiryTicketEntry.prototype.isDoReserving = function() {
    return this.ticketStatus == STUDIO_DO_RESERVING;
};

// TicketEntries definition
var TicketEntries = function() {
    this.entries = {}; // {seatName:TicketEntry}
};

TicketEntries.prototype.log = function() {
    console.log("*** TicketEntries ***");
    console.log("totalPrice=" + this.getTotalPrice());
    console.log("totalCreditFee=" + this.getTotalCreditFee());
    _.each(this.entries, function(ticketEntry) {
        ticketEntry.log();
    });
};

TicketEntries.prototype.get = function(seatName) {
    return this.entries[seatName];
};

TicketEntries.prototype.add = function(seatName) {
    var numOfEntries = this.size();
    if (numOfEntries < common.numOfReservableTickets && !this.get(seatName)) {
        var ticketEntry = new TicketEntry(seatName, numOfEntries == 0);
        this.entries[ticketEntry.seatName] = ticketEntry;
        return ticketEntry;
    } else {
        return null;
    }
};

TicketEntries.prototype.restore = function(inquiryTicketEntry) {
    if (this.size() < common.numOfReservableTickets
            && !this.get(inquiryTicketEntry.seatName)) {
        var ticketEntry = new TicketEntry(inquiryTicketEntry.seatName, false);
        ticketEntry.restore(inquiryTicketEntry);
        this.entries[ticketEntry.seatName] = ticketEntry;
        return ticketEntry;
    } else {
        return null;
    }
};

TicketEntries.prototype.remove = function(seatName) {
    var ticketEntry = this.get(seatName);
    if (ticketEntry) {
        delete this.entries[seatName];
        if (ticketEntry.owner) {
            _.find(this.entries, function(ticketEntry) {
                ticketEntry.owner = true;
                return true;
            });
        }
    }
    return ticketEntry;
};

TicketEntries.prototype.clear = function() {
    this.entries = {};
};

TicketEntries.prototype.size = function() {
    return _.size(this.entries);
};

TicketEntries.prototype.getOwner = function() {
    return _.find(this.entries, function(ticketEntry) {
        if (ticketEntry.owner) {
            return true;
        }
    });
};

TicketEntries.prototype.findByEmailAddress = function(emailAddress) {
    return _.find(this.entries, function(ticketEntry) {
        if (ticketEntry.emailAddress == emailAddress) {
            return true;
        }
    });
};

TicketEntries.prototype.findByTicketId = function(ticketId) {
    return _.find(this.entries, function(ticketEntry) {
        if (ticketEntry.ticketId == ticketId) {
            return true;
        }
    });
};

TicketEntries.prototype.getTotalPrice = function() {
    var totalPrice = 0;
    _.each(this.entries, function(ticketEntry) {
        totalPrice += ticketEntry.getPrice();
    });
    return totalPrice;
};

TicketEntries.prototype.getTotalCreditFee = function() {
    var totalCreditFee = 0;
    _.each(this.entries, function(ticketEntry) {
        totalCreditFee += ticketEntry.getCreditFee();
    });
    return totalCreditFee;
};

// TicketEntry definition
var TicketEntry = function(seatName, owner) {
    this.seatName = seatName;
    this.ticketId = 0;
    this.seatId = 0;
    this.owner = owner;
    this.emailAddress = null;
    this.genderCategoryId = 0;
    this.ageGroupCategoryId = 0;
    this.ticketType = 0;
    this.ticketOptionId = 0;
    this.discountId = 0;
    this.initialize(true);
};

TicketEntry.prototype.log = function() {
    console.log("*** TicketEntry ***");
    console.log("seatName=" + this.seatName);
    console.log("ticketId=" + this.ticketId);
    console.log("seatId=" + this.seatId);
    console.log("owner=" + this.owner);
    console.log("emailAddress=" + this.emailAddress);
    console.log("genderCategoryId=" + this.genderCategoryId);
    console.log("ageGroupCategoryId=" + this.ageGroupCategoryId);
    console.log("ticketTypeId=" + this.ticketTypeId);
    console.log("ticketOptionId=" + this.ticketOptionId);
    console.log("discountId=" + this.discountId);
    console.log("price=" + this.getPrice());
    console.log("creditFee=" + this.getCreditFee());
};

TicketEntry.prototype.initialize = function(unconditional) {
    var ticket = tickets[this.seatName];
    this.ticketId = toInt(ticket.ticketId);
    this.seatId = toInt(ticket.seatId);
    this.emailAddress = null;
    if (this.owner && asMember()) {
        if (unconditional) {
            this.genderCategoryId = member.genderCategoryId;
            this.setAgeGroupCategoryId(member.ageGroupCategoryId);
        }
        if (defaultDiscountForMember) {
            this.discountId = defaultDiscountForMember.discountId;
        } else {
            this.discountId = 0;
        }
    } else if (this.owner && member.loggedIn) {
        if (unconditional) {
            this.genderCategoryId = member.genderCategoryId;
            this.setAgeGroupCategoryId(member.ageGroupCategoryId);
        }
        this.discountId = 0;
    } else {
        if (unconditional) {
            this.genderCategoryId = 0;
            this.setAgeGroupCategoryId(0);
        }
        this.discountId = 0;
    }
    if (ticketOptions.length > 0) {
        if (unconditional) {
            this.ticketOptionId = ticketOptions[0].ticketOptionId;
        }
    }
};

TicketEntry.prototype.setAgeGroupCategoryId = function(ageGroupCategoryId) {
    this.ageGroupCategoryId = ageGroupCategoryId;
    this.ticketTypeId = 0;
    if (ageGroupCategoryId > 0) {
        var ageGroupCategory = findAgeGroupCategory(ageGroupCategoryId);
        if (ageGroupCategory) {
            this.ticketTypeId = ageGroupCategory.ticketType.ticketTypeId;
        }
    }
};

TicketEntry.prototype.restore = function(inquiryTicketEntry) {
    this.seatName = inquiryTicketEntry.seatName;
    this.ticketId = inquiryTicketEntry.ticketId;
    this.seatId = inquiryTicketEntry.seatId;
    this.owner = inquiryTicketEntry.owner;
    this.emailAddress = inquiryTicketEntry.emailAddress;
    this.genderCategoryId = inquiryTicketEntry.genderCategoryId;
    this.ageGroupCategoryId = inquiryTicketEntry.ageGroupCategoryId;
    this.ticketTypeId = inquiryTicketEntry.ticketTypeId;
    this.ticketOptionId = inquiryTicketEntry.ticketOptionId;
    this.discountId = inquiryTicketEntry.discountId;
}

TicketEntry.prototype.validateGender = function() {
    return this.genderCategoryId;
};

TicketEntry.prototype.validateAgeGroup = function() {
    return this.ageGroupCategoryId;
};

TicketEntry.prototype.validateEmailAddress = function() {
    if (!this.owner) {
        if (isEmptyString(this.getEmailAddress())) {
            var discount = findDiscount(this.discountId);
            return !discount || !discount.memberOnly;
        }
    }
    return true;
};

TicketEntry.prototype.getEmailAddress = function() {
    if (!this.owner) {
        if (!isEmptyString(this.emailAddress)) {
            var discount = findDiscount(this.discountId);
            if (discount
                    && (discount.memberOnly || this.discountId == couple50Discount.discountId)) {
                return this.emailAddress;
            }
        }
    }
    return null;
};

TicketEntry.prototype.getPrice = function() {
    var price = 0;
    var discount = findDiscount(this.discountId);
    if (discount) {
        price = discount.amount;
    } else {
        var ageGroupCategory = findAgeGroupCategory(this.ageGroupCategoryId);
        price = ageGroupCategory.ticketType.amount;
    }
    var ticketOption = findTicketOption(this.ticketOptionId);
    if (ticketOption) {
        price += ticketOption.totalAmount;
    }
    return price;
};

TicketEntry.prototype.getCreditFee = function() {
    if (this.owner) {
        return asMember() ? 0 : common.creditFee;
    } else {
        return this.getEmailAddress() ? 0 : common.creditFee;
    }
};

TicketEntry.prototype.getDiscountAmount = function() {
    var discount = findDiscount(this.discountId);
    return discount ? discount.amount : 0;
}
