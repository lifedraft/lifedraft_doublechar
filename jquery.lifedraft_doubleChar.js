/*
 * # lifedraft_doubleChar
 * Creates closing and opening characters while typing
 * http://lifedraft.de/
 *
 * Copyright (c) 2009 Stanislav Müller
 * Licensed under the GPL licenses.
 * http://lifedraft.de
 *
 */


jQuery.fn.lifedraft_doubleChar = function() {
  
  //Basic initialze keyCodes, separated in shiftKey and altKey pressed groups.
  var shiftLeftHand = {
    50: {character: "\"",   rel: 50 },
    51: {character: "'",    rel: 51 },
    56: {character: "(",    rel: 57 },
    222: {character: "\"",  rel: 222 } // Safari
  };

  var shiftRightHand = {
    50: {character: "\"",   rel: 50 },
    51: {character: "'",    rel: 51 },
    57: {character: ")",    rel: 56 },
    48: {character: ")",    rel: 56 }, // Safari
    222: {character: "\"",  rel: 222 } // Safari
  };

  var altLeftHand = {
    53: {character: "[", rel: 54}
  };

  var altRightHand = {
    54: {character: "]", rel: 53}
  };
  
  // sets cursor position / selection
  var setSelectionRange = function(element, selectionStart, selectionEnd) {
    
    if (element.setSelectionRange) {
      element.focus();
      element.setSelectionRange(selectionStart, selectionEnd);
    } 
    // IE special method to set selection
    else if (element.createTextRange) {
      var range = element.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionStart);
      range.moveStart('character', selectionEnd);
      range.select();
    }
    
  };
  
  // gets cursor position and selection
  var getSelection = function(element) {

    // IE has another way to find out the cursor position, so go on:
    if(jQuery.browser.msie) {
    	var bookmark = document.selection.createRange().getBookmark();
    	element.selection = element.createTextRange();
    	element.selection.moveToBookmark(bookmark);
    	element.selectLeft = element.createTextRange();
    	element.selectLeft.collapse(true);
    	element.selectLeft.setEndPoint("EndToStart", element.selection);

      return {
        selectionStart: element.selectLeft.text.length,
        selectionEnd: element.selectLeft.text.length +
                      ((element.selection.text.length == 0) ? 0 : element.selection.text.length)
      };
    } 
    // All good browsers support standard methods.
    else {
      return {
        selectionStart: element.selectionStart,
        selectionEnd: element.selectionEnd
      };
    }
  };
  
  // get left and right characters
  var getCharactersLeftRight = function(keyCode, shift, alt) {
    // leftHand char + shift
    if(keyCode in shiftLeftHand && shift && !alt) {
      var characterLeft = shiftLeftHand[keyCode].character;
      var characterRight = shiftRightHand[shiftLeftHand[keyCode].rel].character;
    }
    // rightHand char + shift
    else if(keyCode in shiftRightHand && shift && !alt) {
      var characterRight = shiftRightHand[keyCode].character;
      var characterLeft = shiftLeftHand[shiftRightHand[keyCode].rel].character;
    }
    // leftHand char + alt
    else if (keyCode in altLeftHand && alt) {
      var characterLeft = altLeftHand[keyCode].character;
      var characterRight = altRightHand[altLeftHand[keyCode].rel].character;
    }
    // rightHand char + alt
    else if (keyCode in altRightHand && alt) {
      var characterRight = altRightHand[keyCode].character;
      var characterLeft = altLeftHand[altRightHand[keyCode].rel].character;
    }
    
    // Just fallback, should never get in.
    if(!characterLeft) characterLeft = "";
    if(!characterRight) characterRight = "";
    
    return {
      characterLeft: characterLeft,
      characterRight: characterRight
    };
  };
  
  var doubleCharSet = function(event) {
    var value = this.value,
    keyCode = event.which || event.keyCode,
    shift = event.shiftKey,
    alt = event.altKey,
    _this = this;
    
    // Check whether we pushed on of the whitelisted keyCode + (shiftKey || altKey)
    if((keyCode in shiftLeftHand || 
        keyCode in shiftRightHand || 
        keyCode in altLeftHand || 
        keyCode in altRightHand) && (shift || alt)) {

      // Crossbroser get cursor position and selection
      var selection = getSelection(this);
      var selectionStart = selection.selectionStart;
      var selectionEnd = selection.selectionEnd;

      // Save strings before and after the selection/cursor.
      var before = value.substr(0, selectionStart);
      var after = value.substr(selectionEnd);
      
      // get character in combination with keyCode+shift+alt
      var characters = getCharactersLeftRight(keyCode, shift, alt);

      // we have NO selection here
      if(selectionStart == selectionEnd) {
        // Concat the parts and assign to the value.
        this.value = before + characters.characterLeft + characters.characterRight + after;
        // we need this later to set the cursor in all browsers right
        setSelection = function(){ setSelectionRange(_this, selectionStart+1, selectionEnd+1); };
      } 
      // we have selection here
      else {
        // get the selection part.
        var middle = value.substr(selectionStart, selectionEnd-selectionStart);
        // concat
        var end = before+characters.characterLeft+middle+characters.characterRight;
        // assign concated string to the value
        this.value = end+after;
        // we need this later to set the cursor in all browsers right
        setSelection = function() { setSelectionRange(_this, end.length, end.length); };
      }
      
      if(jQuery.browser.opera) {
        // this is the only way to prevent typing in the pressed character.
        // blur the field
        _this.blur();
        // wait 0.01 msek and set cursor position
        setTimeout(setSelection, 0.01);
      } else {
        // set the cursor
        setSelection();
      }
      
      // prevent typing in the textarea pressed key character.
      return false;
    }
  };
  
  // thx.
  return this.bind("keydown", doubleCharSet);
};