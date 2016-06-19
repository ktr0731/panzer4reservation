// global variables
var defaultGenderCategory = null;
var defaultAgeGroupCategory = null;
var discountsForMember = null;
var discountsForNonMember = null;
var defaultDiscountForMember = null;

var joining = false;

var studioController = null;
var registrationController = null;

// global functions
$(document).ready(function() {
    initialize();
});

var initialize = function() {
    _.find(genderCategories, function(genderCategory) {
        if (genderCategory.defaultCategory) {
            defaultGenderCategory = genderCategory;
            return true;
        }
    });
    _.each(ageGroupCategories, function(ageGroupCategory) {
        if (ageGroupCategory.defaultCategory) {
            defaultAgeGroupCategory = ageGroupCategory;
        }
        var ticketTypeId = ageGroupCategory.ticketTypeId;
        ageGroupCategory.ticketType = ticketTypes[ticketTypeId];
    });
    discountsForMember = discounts;
    discountsForNonMember = [];
    _.each(discounts, function(discount) {
        if (discount.memberOnly) {
            if (!defaultDiscountForMember) {
                if (_.isEmpty(member.discountIds)
                        || _.find(member.discountIds, function(discountId) {
                            return discountId == discount.discountId;
                        })) {
                    defaultDiscountForMember = discount;
                }
            }
        } else {
            discountsForNonMember.push(discount);
        }
    });
    studioController = new StudioController();
    registrationController = new RegistrationController(false);
    registrationController.setupForRegistration();
};

var asMember = function() {
    return member.valid || joining;
};

var isAvailable = function() {
    if (asMember()) {
        if (program.availableForMember || program.availableForNonMember) {
            return true;
        }
    } else {
        if (program.availableForNonMember) {
            return true;
        }
    }
    return false;
};

var findDiscount = function(discountId) {
    if (discountId > 0) {
        return _.find(discounts, function(discount) {
            if (discount.discountId == discountId) {
                return true;
            }
        });
    }
};

var findGenderCategory = function(genderCategoryId) {
    var genderCategory = null;
    if (genderCategoryId > 0) {
        genderCategory = _.find(genderCategories, function(category) {
            if (category.categoryId == genderCategoryId) {
                return true;
            }
        });
    }
    return genderCategory ? genderCategory : defaultGenderCategory;
};

var findAgeGroupCategory = function(ageGroupCategoryId) {
    var ageGroupCategory = null;
    if (ageGroupCategoryId > 0) {
        ageGroupCategory = _.find(ageGroupCategories, function(category) {
            if (category.categoryId == ageGroupCategoryId) {
                return true;
            }
        });
    }
    return ageGroupCategory ? ageGroupCategory : defaultAgeGroupCategory;
};

var findTicketOption = function(ticketOptionId) {
    if (ticketOptionId > 0) {
        return _.find(ticketOptions, function(ticketOption) {
            if (ticketOption.ticketOptionId == ticketOptionId) {
                return true;
            }
        });
    }
};
