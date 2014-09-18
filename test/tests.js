var expect = chai.expect;

if (history.emulated)
    console.log('Emulated Html5 History API');
else
    console.log('Native Html5 History API');

history.init({
    hashChangeAlone: true,
    setStateEvent:true,
    basePath: "/",
    hid:true
});

var counter = {
	popstate:0,
	hashchange:0,
	setstate:0
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



describe("state null at init", function(){
	expect(history.state).equals(null);
});
describe("pushState 1", function(){

	history.pushState(null, null, "/hello/world#zoo");

	beforeEach(function(done){
		setTimeout(function(){
			done();
		}, 50);
	});

	it("first push state with hash", function(){
		//expect(history.state).equals(null);
		expect(history.location.hash).equals("zoo");
		expect(history.location.path).equals("/hello/world?");
		expect(history.location.href).equals("/hello/world#zoo");
		expect(counter.popstate).equals(0);
		expect(counter.hashchange).equals(0);
		expect(counter.setstate).equals(1);
	});
 
});