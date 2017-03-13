import React from "react";
import { initial } from 'rakt'

@initial(({ req, done }) => {  
  setTimeout(() => {
    done(undefined, { wahoo: Math.random() * 1000 })  
  }, 1000)  
})
export default class A extends React.Component {
  render() {
    return <div> 
      we here in A  
      {JSON.stringify(this.props.data || 'not here')}
    </div>;
  }
}

