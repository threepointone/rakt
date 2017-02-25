(nb: This is just a sketch, doesn't work yet)
(nb: some knowledge of server side rendering react required)


consider the following layout for a hypothetical ecommerce home page 

```
+--------------------------------------+-----+
| logo                                |  (3) | 
| men  women  kids  pets              | cart |
+--------------------------------------+-----+
||                         ||               ||
||                         ||   banner      ||
||                         ||               ||
|| <+      carousel     +> ||               ||
||                         |-----------------|
||                         ||               ||
||                         ||   banner      ||
||                         ||               ||
|--------------------------------------------|
||                                      + - ||
||                                          ||
||                 osm maps                 ||
||                                          ||
||                                          ||
+-----------------~~~FOLD~~~-----------------+
||              ||             ||           ||
||              ||             ||           ||
||              ||             ||           ||
||    misc      ||    misc     ||   misc    ||
||              ||             ||           ||
||              ||             ||           ||
||              ||             ||           ||
||              ||             ||           ||
+--------------------~~~~~~------------------+
                    (~etc~)
```

at first glance, this doesn't seem too hard to implement. you can bust out a plain html/css prototype over a couple of hours, and then get to work on the javascript and such. here's a list of made up scenarios that you might face - 

- you might model it as an SPA through and through, but you notice the site takes way too long to start up, what with you loading *all* your css/js etc in one go, and only then rendering the page 
- you might then make separate entry points, and/or use `import()` code splits to lighten the initial bundle
- perceived speed is still really slow tho, and you notice that a lot of the page is 'static', and can do with plain html and links; you then SSR the page to make so the user has *something* to interact with as soon as possible. that introduces its own problems tho... 
- you may not want to SSR stuff below the ~~~fold~~~. or maybe you do. 
- you want to defer loading of the top-right cart to the browser; it's an 'expensive' operation, and might depend on a browser cookie or whatever
- you start getting bug reports that the carousel doesn't 'work', because while you're rendering the carousel (controls and all), you still need to load the whole js bundle just so that controls works, but that doesn't stop people from clicking on them before that
- specific to react- when you start up a react app on an SSRed page, you need to have the modules and data corresponding to that html ready, for react's first pass when you call .render()...
- as an example - consider the osm maps block; perhaps we'd like to 'universally' render the tiles on the server, yet load the javascript corresponding to it, asynchronously. with the react model, we won't be able to preserve the tiles we rendered, leaving us to blow the tiles away and show a loading spinner instead. 
- finally, how do we do this *consistently*? Product requirements can change on a daily basis, and you don't want to rewrite your stack for any of these options. Is there a single, *SIMPLE* model that unifies all the above requirements?
- etc etc etc 

This list isn't meant to intimidate :) If you notice, these are problems we've been solving for years, with mutable DOMs and a hack or two. The answers are a little hazier in the react world, this is my take with rakt.

- default
```jsx
<Route path='/' exact module='./home.js' />
```
When used with SSR, this will render content on the server, and expect the chunk corresponding to `home.js` to be available when react picks up on the browser. Without SSR, it'll load the module and render in place. When navigated to (via <Link/>, pushState, etc), the module will load asynchronously, and then render as expected. This is fairly typical react+SPA behavior. 

- defer 
```jsx
<Route path='/' exact module='./cart.js' defer />
```
Simply adding a `defer` attribute should signal that this component should not be rendered during SSR. The module will load and render asynchronously on the browser.

- preserve
```jsx
<Route path='/' exact module='./maps.js' preserve />
```
The `preserve` attribute will let rakt render the component html during SSR, but will not include the module for initial render, but *will* preserve the prerendered html until the module asynchronously loads. 

- leaf
```jsx
<Route path='/' exact module='./carousel.js' leaf />
```
To explain the problem again, 
- we want to load *just* the chunk for the carousel, render it the point where we SSRed, *then* load the main bundle, render the whole page, doing a handoff with the carousel *already* in motion, preserving state (in this case, the 'active' slide)
