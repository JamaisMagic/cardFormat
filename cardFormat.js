/**
 * @cardFormat	format the credit card, expiry date cad cvc
 * @author  Jamais
 * @email  1350756140@qq.com
 * @date   2014/10/21
 *
 */

;(function(window, document, undefined) {
    var exp = {};

    var isCardKeyPress = false;
    var isExpiryKeyPress = false;
    var isCvcKeyPress = false;

    var cardPrevLen = 0;
    var expiryPrevLen = 0;
    var cvcPrevLen = 0;

    var isPaddingMonth = false;

    var CARD_MAX_LENGTH = 16;
    //字符串长度在js中限制，最好不要再HTML中使用maxlength属性，不然又得浏览器会出问题，要用就自定义一个属性吧。

    /*
    * card
    * @params options object
    * {
    *   container: 'selector', @require
    *   cardNumber: 'selector', @optional
    *   expiry: 'selector', @optional
    *   cvc: 'selector' @optional
    * }
    *
    * */

     function card(options) {
        var obj = {};

        var container = document.querySelector(options.container);
        var card = container.querySelector(options.cardNumber);
        var expiry = container.querySelector(options.expiry);
        var cvc = container.querySelector(options.cvc);

        card && card.addEventListener('keypress', formatCard, false);
        card && card.addEventListener('input', formatCardInput, false);
        card && card.addEventListener('keydown', delChar, false);
        expiry && expiry.addEventListener('keypress', formatExpiry, false);
        expiry && expiry.addEventListener('input', formatExpiryInput, false);
        expiry && expiry.addEventListener('keydown', delChar, false);
        expiry && expiry.addEventListener('keydown', delMonthPadding, false);
        cvc && cvc.addEventListener('keypress', formatCvc, false);
        cvc && cvc.addEventListener('input', formatCvcInput, false);

        function destroy() {
            card && card.removeEventListener('keypress', formatCard, false);
            card && card.removeEventListener('input', formatCardInput, false);
            card && card.removeEventListener('keydown', delChar, false);
            expiry && expiry.removeEventListener('keypress', formatExpiry, false);
            expiry && expiry.removeEventListener('input', formatExpiryInput, false);
            expiry && expiry.removeEventListener('keydown', delChar, false);
            expiry && expiry.removeEventListener('keydown', delMonthPadding, false);
            cvc && cvc.removeEventListener('keypress', formatCvc, false);
            cvc && cvc.removeEventListener('input', formatCvcInput, false);
        }
        obj.destroy = destroy;
        return obj;
    }

    function formatCard(evt) {
        isCardKeyPress = true;
        evt.preventDefault();
        var target = evt.target;
        var code = evt.which || evt.keyCode;
        var val = target.value.trim();
        var length1 = val.length;
        var currentChar = String.fromCharCode(code);

        var selectionStart = target.selectionStart;
        var selectionEnd = target.selectionEnd;

        var isRight = selectionEnd == length1;

        //在前面判断光标位置
        var isEqual4 = selectionEnd == 4;
        var isEqual9 = selectionEnd == 9;
        var isEqual14 = selectionEnd == 14;

        val = val.slice(0, selectionEnd) + currentChar + val.slice(selectionEnd);
        val = numberFilter(val).slice(0, CARD_MAX_LENGTH);

        val = groupingString(val, ' ', 4);

        function setRange() {
            if(isEqual4 || isEqual9 || isEqual14) {
                target.setSelectionRange(selectionEnd + 2, selectionEnd + 2);
            } else {
                target.setSelectionRange(selectionEnd + 1, selectionEnd + 1);
            }
        }

        return setTimeout(function() {
            target.value = val;
            if(!isRight) {
                setRange();
            } else {
                target.select();
                target.setSelectionRange(val.length, val.length);
            }
            trigger(target, 'input');
        }, 0);
    }

    function formatCardInput(evt) {
        var target = evt.target;
        //keypress键盘事件失效才调用 miui-4.10.18系统和MEIZU MXckp2 M040 Flyme OS 3.8.5A的bug
        if(isCardKeyPress) {
            target.removeEventListener('input', formatCardInput, false);
            return;
        }

        var oriVal = target.value;
        var val = oriVal.trim();
        var oriLength = oriVal.length;
        var length1 = val.length;

        var selectionStart = target.selectionStart;
        var selectionEnd = target.selectionEnd;

        var isRight = selectionEnd == length1;
        var isDelete = oriLength < cardPrevLen;

        //在前面判断光标位置
        var isEqual4 = selectionEnd == 4;
        var isEqual9 = selectionEnd == 9;
        var isEqual14 = selectionEnd == 14;

        val = numberFilter(val).slice(0, CARD_MAX_LENGTH);

        val = groupingString(val, ' ', 4);

        setTimeout(function() {
            if(isDelete) {
                cardPrevLen = target.value.length;
                return;
            }
            if(isRight) {
                target.value = val;
                target.select();
                target.setSelectionRange(val.length, val.length);
            } else {
                target.value = val;
                setRange();
            }
            if(oriLength > 19) {
                trigger(target, 'input');
            }
            cardPrevLen = target.value.length;
        }, 0);

        function setRange() {
            if(isEqual4 || isEqual9 || isEqual14) {
                target.setSelectionRange(selectionEnd + 1, selectionEnd + 1);
            } else {
                target.setSelectionRange(selectionEnd, selectionEnd);
            }
        }
    }

    function formatExpiry(evt) {
        isExpiryKeyPress = true;
        evt.preventDefault();
        var target = evt.target;

        var code = evt.which || evt.keyCode;
        var val = target.value.trim();
        var currentChar = String.fromCharCode(code);

        var length2 = val.length;

        var selectionStart = target.selectionStart;
        var selectionEnd = target.selectionEnd;
        var isEqual2 = selectionEnd == 2;
        var isRight = selectionEnd == length2;

        val = val.slice(0, selectionEnd) + currentChar + val.slice(selectionEnd);
        val = numberFilter(val).slice(0, 6);
        val = groupingString(val, '/', [2, 4]);

        if(val.length == 1 && val >= 2) {
            val = paddingMonth(val);
            isPaddingMonth = true;
        }

        function setRange() {
            if(isEqual2) {
                target.setSelectionRange(selectionEnd + 2, selectionEnd + 2);
            } else {
                target.setSelectionRange(selectionEnd + 1, selectionEnd + 1);
            }
        }

        return setTimeout(function() {
            target.value = val;
            if(!isRight) {
                setRange();
            } else {
                target.select();
                target.setSelectionRange(val.length, val.length);
            }
            trigger(target, 'input');
        }, 0);
    }

    function formatExpiryInput(evt) {
        var target = evt.target;
        if(isExpiryKeyPress) {
            target.removeEventListener('input', formatExpiryInput, false);
            return;
        }

        var oriVal = target.value;
        var val = oriVal.trim();
        var oriLength = oriVal.length;

        var length2 = val.length;

        var selectionStart = target.selectionStart;
        var selectionEnd = target.selectionEnd;

        var isEqual2 = selectionEnd == 2;

        var isRight = selectionEnd == length2;
        var isDelete = oriLength < expiryPrevLen;

        val = numberFilter(val).slice(0, 6);
        val = groupingString(val, '/', [2, 4]);

        if(val.length == 1 && val >= 2) {
            val = paddingMonth(val);
            isPaddingMonth = true;
        }

        setTimeout(function() {
            if(isDelete) {
                expiryPrevLen = target.value.length;
                return;
            }
            if(isRight) {
                target.value = val;
                target.select();
                target.setSelectionRange(val.length, val.length);
            } else {
                target.value = val;
                setRange();
            }
            if(oriLength > 7) {
                trigger(target, 'input');
            }
            expiryPrevLen = target.value.length;
        }, 0);

        function setRange() {
            if(isEqual2) {
                target.setSelectionRange(selectionEnd + 1, selectionEnd + 1);
            } else {
                target.setSelectionRange(selectionEnd, selectionEnd);
            }
        }
    }

    function formatCvc(evt) {
        isCvcKeyPress = true;
        evt.preventDefault();
        var target = evt.target;
        var val = target.value.trim();
        var maxLength = target.getAttribute('data-maxlength') || 4;

        var code = evt.which || evt.keyCode;

        var currentChar = String.fromCharCode(code);

        var length2 = val.length;

        var selectionStart = target.selectionStart;
        var selectionEnd = target.selectionEnd;

        val = val.slice(0, selectionEnd) + currentChar + val.slice(selectionEnd);

        target.value = numberFilter(val).slice(0, maxLength);
        target.setSelectionRange(selectionEnd + 1, selectionEnd + 1);
        trigger(target, 'input');
    }

    function formatCvcInput(evt) {
        var target = evt.target;
        var val = target.value.trim();
        var maxLength = target.getAttribute('data-maxlength') || 4;

        if(isCvcKeyPress) {
            target.removeEventListener('input', formatCvcInput, false);
            return;
        }
        target.value = numberFilter(val).slice(0, maxLength);
        target.setSelectionRange(target.selectionEnd, target.selectionEnd);
    }

    function delChar(evt) {
        var target = evt.target;
        var code = evt.which || evt.keyCode;
        var val = target.value;

        if (code !== 8) {
            return;
        }

        if (target.selectionEnd !== val.length) {
            return;
        }

        if (/\d\s$/.test(val)) {
            evt.preventDefault();
            return setTimeout(function() {
                target.value =  val.replace(/\d\s$/, '');
            }, 0);
        } else if (/\s\d?$/.test(val)) {
            evt.preventDefault();
            return setTimeout(function() {
                target.value =  val.replace(/\s\d?$/, '');
            }, 0);
        } else if(/\d?\/$/.test(val)) {
            evt.preventDefault();
            return setTimeout(function() {
                target.value = val.replace(/\d?\/$/, '');
            }, 0);
        }
    }

    function delMonthPadding(evt) {
        var target = evt.target;
        var code = evt.which || evt.keyCode;
        var val = target.value;

        if (code !== 8) {
            return;
        }

        if (target.selectionEnd !== val.length) {
            return;
        }

        if (isPaddingMonth && /0[2-9]\/$/.test(val)) {
            evt.preventDefault();
            return setTimeout(function() {
                target.value =  val.replace(/0[2-9]\/$/, '');
                isPaddingMonth = false;
            }, 0);
        }
    }

    function paddingMonth(input) {
        input = (input + '').trim();
        if(input && input.length == 1 && input >= 2) {
            return '0' + input + '/';
        } else {
            return input;
        }
    }

    function numberFilter(input) {
        return (input + '').replace(/\D/g, '');
    }

    //以特定字符分隔字符串
    function groupingString(str, divider, groupLength) {
        var output = (str + '');
        var strArr = output.split('');
        var outputArr;
        var groupLengths;

        divider = divider + '';
        if(Array.isArray(groupLength)) {
            outputArr = [];
            groupLengths = groupLength.length;

            if(groupLengths == 0) {
                throw new Error('the array should not be empty');
            }
            if(groupLengths > 1) {
                groupLength.forEach(function(item, index, arr) {
                    item = parseInt(item, 10);
                    if(index < groupLengths - 1) {

                        if(strArr.length >= 2 && strArr.length >= item) {
                            outputArr.push((strArr.splice(0, item)).join('') + divider);
                        } else {
                            outputArr.push((strArr.splice(0, item)).join(''));
                        }
                    } else {
                        outputArr.push(groupingString(strArr.join(''), divider, item));
                    }
                });
                return outputArr.join('');
            } else {
                groupingString(str, divider, groupLength[0]);
            }
        } else {
            groupLength = parseInt(groupLength, 10);

            if(strArr.length >= 2 && strArr.length > groupLength) {
                output = strArr.reduce(function(prev, curr, index , arr) {

                    if((index) % groupLength === 0) {
                        return prev + divider + curr;
                    } else {
                        return prev + curr;
                    }

                });
            }
        }
        return output;
    }

    function trigger(element, event) {
        var evtObj = document.createEvent('HTMLEvents');
        evtObj.initEvent(event, true, true);
        element.dispatchEvent(evtObj);
    }

    exp.cardFormat = card;

    if(typeof module === "object" && typeof module.exports === "object") {
        module.exports = exp;
    } else {
        window.JamCardFormat = exp;
    }

})(window, document);
