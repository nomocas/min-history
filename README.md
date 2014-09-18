# min-history : html5 history shim for IE8+, FF3+, Chrom, Safari, ...


```
<!DOCTYPE html>
<html>

<head>
    <!--[if IE 8]><script src="../node_modules/ie8/build/ie8.js"></script><![endif]-->
    <script type="text/javascript" src="../lib/min-history.js"></script>
</head>

<body>
    <a class="ajax" title="my link title" href="/mylink">My Link</a>
    <a class="ajax" title="otherlink title" href="/otherlink">Other Link</a>
    <a class="ajax" href="/otherlink#foo">third Link</a>
    <a class="ajax" href="/third/link">third Link</a>
    <a class="ajax" href="/third/link#doe">third Link doe</a>
    <a class="ajax" href="/bar">bar</a>
    <a class="ajax" href="/bar#zoo">bar zoo</a>
    <a class="ajax" href="/bar?bloupi#zoo">bar bloupi zoo</a>
    <script type="text/javascript">
    (function() {

        if (history.emulated)
            console.log('Emulated Html5 History API');
        else
            console.log('Native Html5 History API');

        history.init({
            hashChangeAlone: true,
            setStateEvent:true,
            basePath: "/example",
            hid:true
        });

        var count = 0;
        var links = document.querySelectorAll('a.ajax');
        for (var i = 0; i < links.length; i++)
        {
            links[i].onclick = function(e) {
                console.log("CLICK");
                if(e && typeof e.preventDefault !== 'undefined')
                    e.preventDefault();
                history.pushState({
                        hello: "world " + (++count)
                    }, 
                    this.title || ("hello world : " + count),
                    this.href);
                return false;
            };
        }
        // popstate event from back/forward in browser
        window.addEventListener('popstate', function(e) {
            console.log("* POP STATE : " + history.location.relative, " - ", JSON.stringify(history.state));
        });

        // hashchange event from back/forward in browser
        window.addEventListener('hashchange', function(e) {
            console.log("* HASH CHANGE " + history.location.hash, " - ", JSON.stringify(history.state));
        });

        // setstate event when pushstate or replace state
        window.addEventListener('setstate', function(e) {
            console.log("* SET STATE " + history.location.relative, " - ", JSON.stringify(history.state));
        });

    })();
    </script>
</body>

</html>
```