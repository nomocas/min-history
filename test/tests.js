var expect = chai.expect;

if (history.emulated)
	console.log('Emulated Html5 History API');
else
	console.log('Native Html5 History API');

history.init({
	hashChangeAlone: true,
	setStateEvent: true,
	basePath: "/test",
	hid: true
});

var counter = {
	popstate: 0,
	hashchange: 0,
	setstate: 0
};

// popstate event from back/forward in browser
window.addEventListener('popstate', function(e) {
	console.log("* POP STATE : " + history.location.relative, " - ", JSON.stringify(history.state));
	counter.popstate++;
});

// hashchange event from back/forward in browser
window.addEventListener('hashchange', function(e) {
	console.log("* HASH CHANGE " + history.location.hash, " - ", JSON.stringify(history.state));
	counter.hashchange++;
});

// setstate event when pushstate or replace state
window.addEventListener('setstate', function(e) {
	console.log("* SET STATE " + history.location.relative, " - ", JSON.stringify(history.state));
	counter.setstate++;
});

describe("state null at init", function() {
	it("should", function() {
		expect(history.state).equals(null);
	});
});

describe("first bunch", function() {
	//beforeEach(function(done){ console.log("apply delay beforeEach"); setTimeout(done, 60); });
	counter.popstate = 0;
	counter.hashchange = 0;
	counter.setstate = 0;

	describe("pushState 1", function() {
		before(function(done) {
			history.pushState({
				test: "test 1"
			}, "title 1", "/hello/world#zoo");
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(history.location.hash).equals("zoo");
			expect(document.title, "title 1");
			expect(history.state.test, "test 1");
			expect(history.location.path).equals("/hello/world");
			expect(history.location.relative).equals("/hello/world#zoo");
			expect(counter.popstate).equals(0);
			expect(counter.hashchange).equals(0);
			expect(counter.setstate).equals(1);
		});

	});
	describe("pushState 2", function() {
		before(function(done) {
			history.pushState({
				test: "test 2"
			}, "title 2", "/hello/world");
			setTimeout(done, 60);
		});

		it("should", function() {
			expect(history.location.hash).equals("");
			expect(document.title, "title 2");
			expect(history.state.test, "test 2");
			expect(history.location.path).equals("/hello/world");
			expect(history.location.relative).equals("/hello/world");
			expect(counter.popstate).equals(0);
			expect(counter.hashchange).equals(0);
			expect(counter.setstate).equals(2);
		});
	});
	describe("pushState 3", function() {
		before(function(done) {
			history.pushState({
				test: "test 3"
			}, "title 3", "/foo?bar#zooo");
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(history.location.hash).equals("zooo");
			expect(document.title, "title 3");
			expect(history.state.test, "test 3");
			expect(history.location.path).equals("/foo?bar");
			expect(history.location.relative).equals("/foo?bar#zooo");
			expect(counter.popstate).equals(0);
			expect(counter.hashchange).equals(0);
			expect(counter.setstate).equals(3);
		});
	});
	describe("pushState 4", function() {
		before(function(done) {
			history.pushState({
				test: "test 4"
			}, "title 4", "/foo?bari#zooo");
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 4");
			expect(history.state.test, "test 4");
			expect(history.location.hash).equals("zooo");
			expect(history.location.path).equals("/foo?bari");
			expect(history.location.relative).equals("/foo?bari#zooo");
			expect(counter.popstate).equals(0);
			expect(counter.hashchange).equals(0);
			expect(counter.setstate).equals(4);
		});
	});
	describe("pushState 5", function() {
		before(function(done) {
			history.pushState({
				test: "test 5"
			}, "title 5", "/foo?bari#lolipop");
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 5");
			expect(history.state.test, "test 5");
			expect(history.location.hash).equals("lolipop");
			expect(history.location.path).equals("/foo?bari");
			expect(history.location.relative).equals("/foo?bari#lolipop");
			expect(counter.popstate).equals(0);
			expect(counter.hashchange).equals(0);
			expect(counter.setstate).equals(5);
		});
	});
	describe("back 1", function() {
		before(function(done) {
			history.back();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 4");
			expect(history.state.test, "test 4");
			expect(history.location.hash).equals("zooo");
			expect(history.location.path).equals("/foo?bari");
			expect(history.location.relative).equals("/foo?bari#zooo");
			expect(counter.popstate).equals(0);
			expect(counter.hashchange).equals(1);
			expect(counter.setstate).equals(5);
		});
	});
	describe("back 2", function() {
		before(function(done) {
			history.back();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 3");
			expect(history.state.test, "test 3");
			expect(history.location.hash).equals("zooo");
			expect(history.location.path).equals("/foo?bar");
			expect(history.location.relative).equals("/foo?bar#zooo");
			expect(counter.popstate).equals(1);
			expect(counter.hashchange).equals(1);
			expect(counter.setstate).equals(5);
		});
	});

	describe("back 3", function() {
		before(function(done) {
			history.back();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 2");
			expect(history.state.test, "test 2");
			expect(history.location.hash).equals("");
			expect(history.location.path).equals("/hello/world");
			expect(history.location.relative).equals("/hello/world");
			expect(counter.popstate).equals(2);
			expect(counter.hashchange).equals(1);
			expect(counter.setstate).equals(5);
		});
	});

	describe("back 4", function() {
		before(function(done) {
			history.back();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 1");
			expect(history.state.test, "test 1");
			expect(history.location.hash).equals("zoo");
			expect(history.location.path).equals("/hello/world");
			expect(history.location.relative).equals("/hello/world#zoo");
			expect(counter.popstate).equals(2);
			expect(counter.hashchange).equals(2);
			expect(counter.setstate).equals(5);
		});
	});

	describe("forward 1", function() {
		before(function(done) {
			history.forward();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 2");
			expect(history.state.test, "test 2");
			expect(history.location.hash).equals("");
			expect(history.location.path).equals("/hello/world");
			expect(history.location.relative).equals("/hello/world");
			expect(counter.popstate).equals(2);
			expect(counter.hashchange).equals(3);
			expect(counter.setstate).equals(5);
		});
	});

	describe("forward 2", function() {
		before(function(done) {
			history.forward();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 3");
			expect(history.state.test, "test 3");
			expect(history.location.hash).equals("zooo");
			expect(history.location.path).equals("/foo?bar");
			expect(history.location.relative).equals("/foo?bar#zooo");
			expect(counter.popstate).equals(3);
			expect(counter.hashchange).equals(3);
			expect(counter.setstate).equals(5);
		});
	});
	describe("forward 3", function() {
		before(function(done) {
			history.forward();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 4");
			expect(history.state.test, "test 4");
			expect(history.location.hash).equals("zooo");
			expect(history.location.path).equals("/foo?bari");
			expect(history.location.relative).equals("/foo?bari#zooo");
			expect(counter.popstate).equals(4);
			expect(counter.hashchange).equals(3);
			expect(counter.setstate).equals(5);
		});
	});
	describe("forward 4", function() {
		before(function(done) {
			history.forward();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 5");
			expect(history.state.test, "test 5");
			expect(history.location.hash).equals("lolipop");
			expect(history.location.path).equals("/foo?bari");
			expect(history.location.relative).equals("/foo?bari#lolipop");
			expect(counter.popstate).equals(4);
			expect(counter.hashchange).equals(4);
			expect(counter.setstate).equals(5);
		});
	});
});



describe("Second bunch", function() {
	//beforeEach(function(done){ console.log("apply delay beforeEach"); setTimeout(done, 60); });

	before(function() {
		console.log("START SECOND");
		counter.popstate = 0;
		counter.hashchange = 0;
		counter.setstate = 0;
		history.config.hashChangeAlone = false;
	});
	describe("pushState 1", function() {
		before(function(done) {
			history.pushState({
				test: "test 1"
			}, "title 1", "/hello/world#zoo");
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(history.location.hash).equals("zoo");
			expect(document.title, "title 1");
			expect(history.state.test, "test 1");
			expect(history.location.path).equals("/hello/world");
			expect(history.location.relative).equals("/hello/world#zoo");
			expect(counter.popstate).equals(0);
			expect(counter.hashchange).equals(0);
			expect(counter.setstate).equals(1);
		});

	});
	describe("pushState 2", function() {
		before(function(done) {
			history.pushState({
				test: "test 2"
			}, "title 2", "/hello/world");
			setTimeout(done, 60);
		});

		it("should", function() {
			expect(history.location.hash).equals("");
			expect(document.title, "title 2");
			expect(history.state.test, "test 2");
			expect(history.location.path).equals("/hello/world");
			expect(history.location.relative).equals("/hello/world");
			expect(counter.popstate).equals(0);
			expect(counter.hashchange).equals(0);
			expect(counter.setstate).equals(2);
		});
	});
	describe("pushState 3", function() {
		before(function(done) {
			history.pushState({
				test: "test 3"
			}, "title 3", "/foo?bar#zooo");
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(history.location.hash).equals("zooo");
			expect(document.title, "title 3");
			expect(history.state.test, "test 3");
			expect(history.location.path).equals("/foo?bar");
			expect(history.location.relative).equals("/foo?bar#zooo");
			expect(counter.popstate).equals(0);
			expect(counter.hashchange).equals(0);
			expect(counter.setstate).equals(3);
		});
	});
	describe("pushState 4", function() {
		before(function(done) {
			history.pushState({
				test: "test 4"
			}, "title 4", "/foo?bari#zooo");
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 4");
			expect(history.state.test, "test 4");
			expect(history.location.hash).equals("zooo");
			expect(history.location.path).equals("/foo?bari");
			expect(history.location.relative).equals("/foo?bari#zooo");
			expect(counter.popstate).equals(0);
			expect(counter.hashchange).equals(0);
			expect(counter.setstate).equals(4);
		});
	});
	describe("pushState 5", function() {
		before(function(done) {
			history.pushState({
				test: "test 5"
			}, "title 5", "/foo?bari#lolipop");
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 5");
			expect(history.state.test, "test 5");
			expect(history.location.hash).equals("lolipop");
			expect(history.location.path).equals("/foo?bari");
			expect(history.location.relative).equals("/foo?bari#lolipop");
			expect(counter.popstate).equals(0);
			expect(counter.hashchange).equals(0);
			expect(counter.setstate).equals(5);
		});
	});
	describe("back 1", function() {
		before(function(done) {
			history.back();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 4");
			expect(history.state.test, "test 4");
			expect(history.location.hash).equals("zooo");
			expect(history.location.path).equals("/foo?bari");
			expect(history.location.relative).equals("/foo?bari#zooo");
			expect(counter.popstate).equals(1);
			expect(counter.hashchange).equals(1);
			expect(counter.setstate).equals(5);
		});
	});
	describe("back 2", function() {
		before(function(done) {
			history.back();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 3");
			expect(history.state.test, "test 3");
			expect(history.location.hash).equals("zooo");
			expect(history.location.path).equals("/foo?bar");
			expect(history.location.relative).equals("/foo?bar#zooo");
			expect(counter.popstate).equals(2);
			expect(counter.hashchange).equals(1);
			expect(counter.setstate).equals(5);
		});
	});

	describe("back 3", function() {
		before(function(done) {
			history.back();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 2");
			expect(history.state.test, "test 2");
			expect(history.location.hash).equals("");
			expect(history.location.path).equals("/hello/world");
			expect(history.location.relative).equals("/hello/world");
			expect(counter.popstate).equals(3);
			expect(counter.hashchange).equals(1);
			expect(counter.setstate).equals(5);
		});
	});

	describe("back 4", function() {
		before(function(done) {
			history.back();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 1");
			expect(history.state.test, "test 1");
			expect(history.location.hash).equals("zoo");
			expect(history.location.path).equals("/hello/world");
			expect(history.location.relative).equals("/hello/world#zoo");
			expect(counter.popstate).equals(4);
			expect(counter.hashchange).equals(2);
			expect(counter.setstate).equals(5);
		});
	});

	describe("forward 1", function() {
		before(function(done) {
			history.forward();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 2");
			expect(history.state.test, "test 2");
			expect(history.location.hash).equals("");
			expect(history.location.path).equals("/hello/world");
			expect(history.location.relative).equals("/hello/world");
			expect(counter.popstate).equals(5);
			expect(counter.hashchange).equals(3);
			expect(counter.setstate).equals(5);
		});
	});

	describe("forward 2", function() {
		before(function(done) {
			history.forward();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 3");
			expect(history.state.test, "test 3");
			expect(history.location.hash).equals("zooo");
			expect(history.location.path).equals("/foo?bar");
			expect(history.location.relative).equals("/foo?bar#zooo");
			expect(counter.popstate).equals(6);
			expect(counter.hashchange).equals(3);
			expect(counter.setstate).equals(5);
		});
	});
	describe("forward 3", function() {
		before(function(done) {
			history.forward();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 4");
			expect(history.state.test, "test 4");
			expect(history.location.hash).equals("zooo");
			expect(history.location.path).equals("/foo?bari");
			expect(history.location.relative).equals("/foo?bari#zooo");
			expect(counter.popstate).equals(7);
			expect(counter.hashchange).equals(3);
			expect(counter.setstate).equals(5);
		});
	});
	describe("forward 4", function() {
		before(function(done) {
			history.forward();
			setTimeout(done, 60);
		});
		it("should", function() {
			expect(document.title, "title 5");
			expect(history.state.test, "test 5");
			expect(history.location.hash).equals("lolipop");
			expect(history.location.path).equals("/foo?bari");
			expect(history.location.relative).equals("/foo?bari#lolipop");
			expect(counter.popstate).equals(8);
			expect(counter.hashchange).equals(4);
			expect(counter.setstate).equals(5);
		});
	});
});