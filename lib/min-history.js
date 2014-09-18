/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * @licence MIT
 * Minimalistic, workable, understandable html5 history shim.
 * IE8+, FF3+, Safari, Chrome, ...
 *
 *
 * Remarque : for IE8, please use it in conjonction with https://github.com/WebReflection/ie8
 * (Events listener shim for IE8)
 *
 * TODO :
 * 	test in IE8
 * 	work on creatEvent shim
 *
 * 	write test
 *
 * manage basepath
 * 
 * manage title
 *   ==> as all browser ignore it : 
 *   	=> need to manage it through store even for native.
 *   	=> should use hid in data object to retreieve it on popstate
 *   
 * manage internal/external flag
 */
(function() {
	'use strict';
	if (!window.history) // too old !!! ;)
		return;

	// ___________________________________________________________ UTILS
	var _uaMatch = function(ua) {
		ua = ua.toLowerCase();
		var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
			/(webkit)[ \/]([\w.]+)/.exec(ua) ||
			/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
			/(msie) ([\w.]+)/.exec(ua) ||
			ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
		return {
			browser: match[1] || '',
			version: match[2] || '0'
		};
	};

	var userAgent = function() {
		var browser = {},
			matched = _uaMatch(navigator.userAgent);
		if (matched.browser) {
			browser[matched.browser] = true;
			browser.version = matched.version;
		}
		if (browser.chrome)
			browser.webkit = true;
		else if (browser.webkit)
			browser.safari = true;
		return browser;
	};

	var parseUri = function(str) {
		var o = parseUri.options,
			m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
			uri = {},
			i = 14;
		while (i--)
			uri[o.key[i]] = m[i] || "";
		uri[o.q.name] = {};
		uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) {
			if ($1) uri[o.q.name][$1] = $2;
		});
		return uri;
	};

	parseUri.options = {
		strictMode: true,
		key: ["href", "protocol", "host", "userInfo", "user", "password", "hostname", "port", "relative", "pathname", "directory", "file", "search", "hash"],
		q: {
			name: "query",
			parser: /(?:^|&)([^&=]*)=?([^&]*)/g
		},
		parser: {
			strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
			loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
		}
	};

	var parseURL = function(url) {
		var obj = parseUri(url);
		obj.path = obj.pathname + (obj.search?"?":"") + obj.search;
		return obj;
	};

	// http://stackoverflow.com/questions/9077101/iphone-localstorage-quota-exceeded-err-issue/12976988#12976988
	var sessionStorageSupported = function() {
		try {
			sessionStorage.setItem("test", "test");
			sessionStorage.removeItem("test");
			return true;
		} catch (e) {
			return false;
		}
	};

	// TODO : for the moment hid == Date.now().valueOf(). Could be more sophisticated.
	var produceID = function(){
		return +new Date;
	}

	//______________________________________________________________________ History Shim

	var skipHashChange,
		skipInitPop = false,
		fromGo = false,
		agent = userAgent();

	window.history.parseURL = parseURL;
	window.history.config = {
		hashChangeAlone: true,
		setStateEvent:true,
		//setHashEvent:true,
		storageKey: "min-history",
		basePath: "/",
		hid: true
	};

	// some version of safari (and co) have no "state" property in history. force it.
	window.history.forceState = !("state" in window.history);
	if (window.history.forceState)
		window.history.state = null;

	// safari fire pop state on page load. skip it for consistency.
	if (agent.safari && location.relative !== window.history.config.basePath)
		skipInitPop = true;

	// produce href with hid in search part
	var getHrefWithHid = function(id, location) {
		var search = "?"+ (location.search || "") + "&hid=" + id;
		return (location.pathname || '/') 
			+ search
			+ (location.hash ? ("#" + location.hash) : "");
	};

	// remove hid from location parts. store hid in location.
	var cleanHidFromLocation = function(location) {
		if (!location.search)
			return;
		location.search = location.search.replace(/&hid=([^&]+)/gi, function(c, v) {
			location.hid = v;
			return "";
		});
		location.path = location.pathname + (location.search ? ("?" + location.search) : "");
		location.relative = location.path + (location.hash ? ("#" + location.hash) : "");
		location.href = location.protocol + "://" + location.host + location.relative;
	};

	var removeBasePath = function(location){
		if(!window.history.config.basePath)
			return location;
		location.pathname = location.pathname.substring(window.history.config.basePath.length);
		location.path = location.pathname + (location.search ? ("?" + location.search) : "");
		location.relative = location.path + (location.hash ? ("#" + location.hash) : "");
		location.href = location.protocol + "://" + location.host + location.relative;
		return location;
	};

	var fireStateEvent = function(type, state, action) {
		// TODO : manage IE8 document.createEventObject
		var evt = document.createEvent("CustomEvent");
		evt.initEvent(type, true, true);
		evt.state = state || null;
		if(action)
			evt.action = action;
		return window.dispatchEvent(evt);
	};

	window.history.store = {
		states: null,
		index: -1,
		init: function() {
			if (!(window.history.sessionStorageSupported = sessionStorageSupported()))
				console.warn("You are using custom history API and Session Storage is not supported. You'll loose history when leaving page.");
			
			if (window.history.sessionStorageSupported)
				this.states = JSON.parse(sessionStorage.getItem(window.history.config.storageKey)) || [];
			else
				this.states = [];
			if (!Array.isArray(this.states))
				this.states = [];
		},
		current:function(){
			return this.states[this.index];
		},
		push: function(data, title, url) {
			var state = { data: data, title: title, url: url };
			if(window.history.config.hid)
			{
				state.data = state.data || {};
				state.data.hid = produceID();
			}
			this.index++;
			if (this.index < this.states.length)
				this.states = this.states.slice(0, this.index);
			this.states.push(state);
			return state;
		},
		replace: function(data, title, url) {
			var old = this.states[this.index],
				state = { data: data, title: title, url: url };
			if(window.history.config.hid)
			{
				state.data = state.data || {};
				state.data.hid = (old && old.data && old.data.hid) ? old.data.hid : produceID();
			}
			return this.states[this.index] = state;
		},
		go: function(increment) {
			var i = this.index + increment,
				state = this.states[i];
			if (!state)
				return null;
			this.index = i;
			return state;
		},
		find: function(id) {
			for (var i = 0, len = this.states.length, state; i < len && (state = this.states[i]); ++i)
				if (state.data && state.data.hid == id)
					return state;
			return null;
		},
		save: function() {
			if (window.history.sessionStorageSupported)
				sessionStorage.setItem(window.history.config.storageKey, JSON.stringify(this.states));
		}
	};	
	var setState; 
	if (!window.history.pushState) // EMULATED
	{
		window.history.emulated = true;
		setState = function(type, data, title, url)
		{
			if(title)
				document.title = title;
			this.location = parseURL(url);
			var href = this.location.relative;
			if (this.config.hid)
			{
				this.state = data = this.store[type](data, title, href).data;	// 'push' or 'replace' in store
				href = getHrefWithHid(data.hid, this.location); // launch hashchange
			}
			else
				this.state = data || null;
			if(this.config.setStateEvent)
				fireStateEvent("setstate", this.state, type);
			skipHashChange = true;
			window.location.hash = "!" + href; // launch hashchange
		}
		var originalGo = window.history.go;
		window.history.go = function(arg) {
			if(this.config.hid)
			{
				var state = this.store.go(arg);
				if (!state)
					return null;
				this.state = state.data;
			}
			else
				this.state = null;
			fromGo = true;
			originalGo.call(this, arg);
		};
		window.history.back = function(arg) {
			this.go(-1);
		};
		window.history.forward = function(arg) {
			this.go(1);
		};
	} 
	else // NATIVE
	{
		var originalPushState = window.history.pushState,
			originalReplaceState = window.history.replaceState;
		setState = function(type, data, title, url){
			var original = originalReplaceState;
			if(type == 'push')
				original = originalPushState;
			if(title)
				document.title = title;
			this.location = parseURL(url);
			if(this.config.hid)
				data = this.store[type](data, title, this.location.relative).data; // push or replace in store
			if(this.forceState)
				this.state = data || null;

			var r = original.call(this, data, title, window.history.config.basePath + this.location.relative);
			if(this.config.setStateEvent)
				fireStateEvent('setstate', this.state, type);
			return r;
		}
	}

	window.history.pushState = function(data, title, url) {
		return setState.call(this, 'push', data, title, url);
	};
	window.history.replaceState = function(data, title, url) {
		return setState.call(this, 'replace', data, title, url);
	};

	// Native Only
	var popState = function(e) {
		// console.log("history popState : ", e);
		var stateData = e.state; 
		if (window.history.forceState)
			window.history.state = stateData || null;

		if (skipInitPop) {	// safari popstate at init skipped.
			skipInitPop = false;
			e.stopImmediatePropagation();
			return false;
		}
		skipHashChange = false;
		var tmp = window.history.location,	// old
			current = window.history.location = removeBasePath(parseURL(location.href)), // new
			state;

		if(window.history.config.hid && stateData && stateData.hid)	// try to get state from hid
			state = window.history.store.find(stateData.hid);
		
		if(state)
		{
			// check url equality.
			if(current.relative !== state.url)
				throw new Error("bad state from native popstate (url dont match) "+current.relative+" - "+state.url);
			if(state.title) // force title
				document.title = state.title;
		}
		if (!tmp || tmp.path !== current.path) // relative has change : apply pop state
		{
			if (tmp && tmp.hash !== current.hash)
				skipHashChange = true;
			return true;
		} 
		else // path doesn't change. check hash
		if (tmp.hash !== current.hash && window.history.config.hashChangeAlone)
		{
			e.stopImmediatePropagation();
			return false; // skip popstate if config.hashChangeAlone
		}
		return true; // nothing change : refresh
	};


	var hashChange = function(e) {
		if (skipHashChange) // skip after pushState/replaceState (emulated)  OR  after "path change" from popstate (native), 
		{
			skipHashChange = false;
			e.stopImmediatePropagation();
			return false;
		}
		//______________________________________________________ POP STATE EMULATION
		if (window.history.emulated) // do popstate behaviour
		{
			var state,
				data = null,
				tmp = window.history.location, // swap currentLocation
				current = window.history.location = parseURL(location.hash.substring(2));
			if (window.history.config.hid) // could be from back/next button or manual hash change in address bar.
			{
				cleanHidFromLocation(current); // try to extract hid
				if(!fromGo)
				{
					if (current.hid)
						state = window.history.store.find(current.hid);
					if(state)
						data = state.data || null;
					window.history.state = data;
				}
			}
			if(state && state.title)	// force title
				document.title = state.title;

			if (!tmp || tmp.path !== current.path) { // path == pathname + ? + search
				// path has change : dispatch popstate and skip hashchange
				e.stopImmediatePropagation();
				fireStateEvent("popstate", data);
				return false;
			}
			// path doesn't change. 
			// check hash change : if !hashChangeAlone : dispatch popstate
			if (tmp.hash !== current.hash && !window.history.config.hashChangeAlone)
				fireStateEvent("popstate", data);
		}
		return true; // propagate hashchange
	};

	window.history.init = function(opt) {
		for (var i in opt)
			this.config[i] = opt[i];
		this.location = parseURL(window.location.href);
		window.addEventListener("hashchange", hashChange);
		if (!this.emulated)
			window.addEventListener("popstate", popState);
		if(this.config.hid)
		{
			this.store.init();
			window.addEventListener("unload", function() {
				window.history.store.save();
			});
		}
	};
})();