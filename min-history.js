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
 * manage title
 *
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
		obj.path = obj.pathname + "?" + obj.search;
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

	//______________________________________________________________________ History Shim

	var skipHashChange,
		skipInitPop = false,
		fromGo = false,
		agent = userAgent();

	window.history.parseURL = parseURL;
	window.history.config = {
		hashChangeAlone: true,
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

	var getHrefWithHid = function(id, location) {
		var search = location.search + "&hid=" + id;
		return location.pathname + "?" + search + (location.hash ? ("#" + location.hash) : "");
	}
	var cleanHidFromLocation = function(location) {
		if (!location.search)
			return;
		location.search = location.search.replace(/&hid=([^&]+)/gi, function(c, v) {
			location.hid = v;
			return "";
		});
		location.path = location.pathname + "?" + location.search;
		location.relative = location.path + (location.hash ? ("#" + location.hash) : "");
	}
	if (!window.history.pushState) // EMULATED
	{
		window.history.emulated = true;
		window.history.pushState = function(data, title, url) {
			this.location = parseURL(url);
			skipHashChange = true;
			this.state = this.store.push(data, title, url);
			if (window.history.config.hid)
				window.location.hash = "!" + getHrefWithHid(this.state.id, this.location);
			else
				window.location.hash = "!" + this.location.relative;
		};
		window.history.replaceState = function(data, title, url) {
			this.location = parseURL(url);
			skipHashChange = true;
			this.state = this.store.replace(data, title, url);
			if (window.history.config.hid)
				window.location.hash = "!" + getHrefWithHid(this.state.id, this.location);
			else
				window.location.hash = "!" + this.location.relative;
		};

		var originalGo = window.history.go;
		window.history.go = function(arg) {
			var state = this.store.go(arg);
			if (!state)
				return null;
			this.state = state;
			fromGo = true;
			originalGo.call(this, arg);
		};
		window.history.back = function(arg) {
			this.go(-1);
		};
		window.history.forward = function(arg) {
			this.go(1);
		};
		
		if (!(window.history.sessionStorageSupported = sessionStorageSupported()))
			console.warn("You are using emulated history API and Session Storage is not supported. You'll loose history when leaving page.");
		
		window.history.store = {
			states: null,
			index: -1,
			init: function() {
				if (window.history.sessionStorageSupported)
					this.states = JSON.parse(sessionStorage.getItem(window.history.config.storageKey)) || [];
				else
					this.states = [];
				if (!Array.isArray(this.states))
					this.states = [];
			},
			push: function(data, title, url) {
				var state = {
					data: data,
					title: title,
					url: url,
					id: +new Date
				};
				this.index++;
				if (this.index < this.states.length)
					this.states = this.states.slice(0, this.index);
				this.states.push(state);
				return state;
			},
			replace: function(data, title, url) {
				var old = this.states[this.index],
					state = {
						data: data,
						title: title,
						url: url,
						id: (old ? old.id : +new Date)
					};
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
					if (state.id == id)
						return state;
				return null;
			},
			save: function() {
				if (window.history.sessionStorageSupported)
					sessionStorage.setItem(window.history.config.storageKey, JSON.stringify(this.states));
			}
		};
	} 
	else // NATIVE
	{
		var originalPushState = window.history.pushState,
			originalReplaceState = window.history.replaceState;
		window.history.pushState = function(data, title, url) {
			this.location = parseURL(url);
			return originalPushState.call(this, data, title, url);
		};
		window.history.replaceState = function(data, title, url) {
			this.location = parseURL(url);
			return originalReplaceState.call(this, data, title, url);
		};
	}

	// Native Only
	var popState = function(e) {
		// console.log("history popState : ", e);
		if (window.history.forceState)
			window.history.state = e.state;
		if (skipInitPop) {
			skipInitPop = false;
			e.stopImmediatePropagation();
			return false;
		}
		var tmp = window.history.location,
			current = window.history.location = parseURL(location.href);
		skipHashChange = false;
		if (!tmp || tmp.path !== current.path) // relative has change : apply pop state
		{
			if (tmp && tmp.hash !== current.hash)
				skipHashChange = true;
			return true;
		} 
		else // path doesn't change. check hash
		if (tmp.hash !== current.hash && window.history.config.hashChangeAlone) {
			e.stopImmediatePropagation();
			return false; // skip popstate if config.hashChangeAlone
		}
		return true; // nothing change : refresh
	};

	// Emulated Only
	var firePopState = function(state) {
		var evt = document.createEvent("CustomEvent");
		evt.initEvent("popstate", true, true);
		evt.state = state || null;
		return window.dispatchEvent(evt);
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
			var state = null,
				tmp = window.history.location, // swap currentLocation
				current = window.history.location = parseURL(location.hash.substring(2));
			if (!fromGo && window.history.config.hid) // could be from back/next button or manual hash change in address bar.
			{
				// try to extract hid
				cleanHidFromLocation(current);
				if (current.hid)
					state = window.history.store.find(current.hid);
				window.history.state = state;
			}
			if (!tmp || tmp.path !== current.path) { // path == pathname + ? + search
				// path has change : dispatch popstate and skip hashchange
				e.stopImmediatePropagation();
				firePopState(state);
				return false;
			}
			// path doesn't change. 
			// check hash change : if !hashChangeAlone : dispatch popstate
			if (tmp.hash !== current.hash && !window.history.config.hashChangeAlone)
				firePopState(state);
		}
		return true; // propagate hashchange
	};

	window.history.init = function(opt) {
		if (opt)
			for (var i in opt)
				window.history.config[i] = opt[i];
		window.history.location = parseURL(location.href);
		window.addEventListener("hashchange", hashChange);
		if (!window.history.emulated)
			window.addEventListener("popstate", popState);
		else {
			window.history.store.init();
			window.addEventListener("unload", function() {
				window.history.store.save();
			});
		}
	};
})();