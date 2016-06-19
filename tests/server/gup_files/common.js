var lockScreen = function() {
    var element = $("<div />").attr("id", "___LOCK___").addClass("lock-screen");
    $(element).appendTo("body");
};

var unlockScreen = function() {
    $("#___LOCK___").remove();
};

var showElement = function(elementId) {
    $("#" + elementId).attr("style", "");
};

var hideElement = function(elementId) {
    $("#" + elementId).attr("style", "display:none;");
};

var isElementVisible = function(elementId) {
    return $("#" + elementId).css("display") != "none";
};

var scrollTop = function(elementId) {
    $("html,body").animate({
        scrollTop : $("#" + elementId).offset().top
    }, 500);
};

var scrollBottom = function(elementId) {
    var element = $("#" + elementId);
    $("html,body").animate(
            {
                scrollTop : element.offset().top + element.height()
                        - $(window).height()
            }, 500);
};

var toInt = function(str) {
    try {
        return parseInt(str);
    } catch (e) {
        return 0;
    }
};

var toLocaleString = function(num) {
    return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
};

var isEmptyString = function(str) {
    return !str || !$.trim(str);
};

var validateDate = function(year, month, date) {
    var dt = new Date(year, month - 1, date);
    return dt.getFullYear() == year && dt.getMonth() == month - 1
            && dt.getDate() == date;
};

var searchZipCode = function(zipCode, client) {
    if (zipCode && zipCode.length >= 7) {
        var zipCodePrefix = zipCode.substr(0, 3);
        var zipCodeSuffix = zipCode.substr(3, 4);
        zipSearchValueClient = client;
        $.getJSON("http://api.thni.net/jzip/X0401/JSONP/" + zipCodePrefix + "/"
                + zipCodeSuffix + ".js" + "?jsoncallback=?");
    }
};

var zipSearchValueClient = null;

var ZipSearchValue = function(data) {
    if (zipSearchValueClient) {
        zipSearchValueClient(data);
        zipSearchValueClient = null;
    }
};

var encrypt = function(value, uuid) {
    value = encodeURIComponent(value);
    var count = parseInt(value.length / uuid.length);
    var key = "";
    for (var i = 0; i <= count; i++) {
        key += uuid;
    }
    var result = "";
    for (var i = 0; i < value.length; i++) {
        result += ("0" + (value.charCodeAt(i) ^ key.charCodeAt(i)).toString(16))
                .slice(-2);
    }
    return result;
};
