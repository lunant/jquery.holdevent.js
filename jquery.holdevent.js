/**
 * jquery.holdevent.js beta
 * http://lab.sublee.kr/jquery.holdevent.js
 * 
 * Copyright 2010, Lee Heung-sub <heungsub+holdevent@lunant.net>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * See also MIT-LICENSE.txt and GPL-LICENSE.txt 
 */
(function( $, glob, undefined ) {
/**If you use jquery.holdevent.js you can hold events when page is not ready.

Defines some event and calls that.

    >>> var body = $( document.body );
    >>> var func = function() { $.doctest.__test__ = "done"; };
    >>> func = function() { window.__test__ = "done"; }; //doctest: +SKIP
    >>> var handler = function() {
    ...     return _click_( this ) && func();
    ... };
    >>> body.click( handler ); //doctest: +SKIP
    >>> body.click(); //doctest: +SKIP

Then that event is holded to holdevent.

    >>> $.holdevent.queue.length;
    1
    >>> $.holdevent.queue[ 0 ][ 0 ] === document.body;
    true
    >>> window.__test__;
    undefined

And executes that.

    >>> $.holdevent.trigger(); //doctest: +SKIP
    >>> window.__test__;
    done
    >>> $.holdevent.queue.length;
    0
*/
var holdevent = function() {};

holdevent.prototype = {
    queue: [],
    locked: false,

    hold: function( elem, eventType ) {
        /** Pushes an event to the queue.

        It returns false if the page is not ready yet.

            >>> $.holdevent.hold( document.body, "scroll" );
            false
            >>> $.holdevent.queue.length;
            1

        When page is ready it returns true.

            >>> $.holdevent.lock(); //doctest: +SKIP
            >>> $.holdevent.hold( document.body, "scroll" );
            true
            >>> $.holdevent.queue.length;
            1
            >>> $.holdevent.unlock(); //doctest: +SKIP
        */
        if ( this.locked ) {
            return true;
        }
        this.queue.push([ elem, eventType ]);
        $elem = $( elem );
        $elem.data( "cursor", $elem.css( "cursor" ) ).css( "cursor", "wait" );
        return false;
    },

    lock: function() {
        this.locked = true;
        return this;
    },

    unlock: function() {
        this.locked = false;
        return this;
    },

    trigger: function() {
        /** Run all events in the queue.
        */
        var event, elem, eventType, i, locked = this.locked;

        if ( !locked ) {
            this.lock();
        }

        for ( i in this.queue ) {
            event = this.queue[ i ];
            elem = event[ 0 ];
            eventType = event[ 1 ];
            $elem = $( elem );
            $elem.trigger( eventType ).css( "cursor", $elem.data( "cursor" ) );
            delete this.queue[ i ];
        }

        delete this.queue;
        this.queue = [];

        if ( !locked ) {
            this.unlock();
        }

        return this;
    }
};

var self = new holdevent();
$.extend({ holdevent: self });

/** Define functions for holds the event. e.g: _click_, _focus_, _load_, ...
*/
var eventTypes = (
    "blur focus focusin focusout load resize scroll unload click dblclick " +
    "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
    "change select submit keydown keypress keyup error"
).split(" ");

$.each( eventTypes, function() {
    var eventType = this;
    glob[ "_" + eventType + "_" ] = new Function(
        "var elem = arguments[ 0 ];" +
        "return $.holdevent.hold( elem, '" + eventType + "' );"
    );
});

$(function() {
    self.lock().trigger();
});

})( jQuery, this );
