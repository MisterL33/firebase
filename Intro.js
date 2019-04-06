import React, {Component} from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import Video from 'react-native-video'

class Intro extends React.Component {


  onEnd = () => {

	// alert('OK');

	this.props.navigation.navigate("Fire", { idu: 0 })	
	
  };
  

  render () {
    return (
	<View style={styles.container}>

	<Video source={require("broadchurch.mp4")}   // Can be a URL or a local file.
       ref={(ref) => {
         this.player = ref
       }}                                      // Store reference
       style={styles.backgroundVideo} />	  
      </View>
    )
  }
}


// Later on in your styles..
var styles = StyleSheet.create({
  container: {
	flex: 1,
    justifyContent: 'center',       
	alignItems: 'center',
	backgroundColor: '#000000'
  },
  containerb: {
    alignSelf: 'stretch',
    backgroundColor: '#fff',	
	justifyContent: 'center',        
	alignItems: 'center'
  }, 	
  backgroundVideo: {
	justifyContent: 'center',
	alignItems: 'center',
	height: Dimensions.get('window').height * 0.7,        
	width: Dimensions.get('window').width * 1
  },
});

export default Intro