leaf nodes
---

note - work in progress 

Most javascript apps have a 'top down' structure, where the application is initialized starting with the the top-most node in the hierarchy, and working downwards. This usually implies that you need to load all the javascript for the current 'view' before you run any code. This is fine in most cases. 

The problem with the above manifests itself in "heavy" apps with some interactivity and/or weak connectivity. Lemme give you an example - pretty much every ecommerce website's homepage product carousel. Here's an ascii rendition of the same -

```
+-------------------------------------+------+
| logo                                |  (3) | 
|                                     | cart |
+-------------------------------------+------+
||                         ||               ||
||                         ||   banner      ||
||                         ||               ||
|| <+      carousel     +> ||               ||
||                         |-----------------|
||                         ||               ||
||                         ||   banner      ||
||           2/5           ||               ||
|--------------------------------------------|
||                                          ||
||                                          ||
```

Usually, we render the content html first (including controls and all), then load the javascript, attach handlers and so on, and carry on with the app. However, if the internet connection isn't very fast, and/or js bundle too big, then we have a period of UI-uncanny-valley, where the user might click the carousel controls, see no behavior, and imagine the website is broken. This leads to dropoff, conversion loss, social media abuse, trump becoming president... you get the drill. We have a few options to workaround this - 

- don't do SSR - go whole hog on 'client side only'/SPA arch, and render content only once your js has loaded. 
- don't show interactive controls until the js bundle has loaded - this gives a more 'progressive' feel to your arch
- first load js just for the carousel, then for the rest of the app. 

This doc focuses on the 3rd option, in react/like environments, as implemented in rakt. 

The desired api is something like this -
```diff
export class App extends React.Component{
  render(){
    return <div>
      <Header />
-     <Carousel />
+     <Leaf module='./carousel' />    
      ...  
    </div>
  }
}
```

This is the sequence we'd like - 

- render html
- load carousel.js (and its deps)
- 'start' the carousel, with original props
- load the rest of the application
- 'start' the app, seamlessly picking up the carousel component 

While this is fairly doable, it's the last step that causes complications. Because react doesn't support this flow in a first class manner[1], the 'state' of the carousel will be blown away when we load the rest of the app and 'remount'. We work around it by feeding our own state+helpers into the component, with the guarantee that it'll retain this state when 'remounted'. Example -

old - 
```jsx
class Carousel extends React.Component{
  state = {
    current: 0
  }
  setSlide(n){
    this.setState({ current: n })
  }
  render(){
    let { slides } = this.props
    return <div>
      <button onClick={() => this.setSlide(this.state.current - 1)}> <+ </button>
      {slides[this.state.current]}
      <button onClick={() => this.setSlide(this.state.current + 1)}> +> </button>
    </div>
  }
}
```

new - 
```jsx
@leaf(props => ({
  current: 0
}))
class Carousel extends React.Component{
  setSlide(n){
    this.props.setState({ current: n })
  }
  render(){
    let { slides, state, setState } = this.props
    return <div>
      <button onClick={() => this.setSlide(state.current - 1)}> <+ </button>
      {slides[state.current]}
      <button onClick={() => this.setSlide(state.current + 1)}> +> </button>
    </div>
  }
}
```

[1] - ...yet! nothing that some chutzpah and a custom fiber renderer couldn't solve. Soon, hopefully!

nb: hello web components folks! Before you start @-ing me that wc/polymer/skate 'solves' this problem, I'd like to acknowledge that the inspiration for the above clearly comes from them. react/dialects solve much more though (syncing/composition/ssr, to name a few), which is why I'm attempting to solve this in react land. 