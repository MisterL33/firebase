import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableHighlight, Modal, Alert, WebView } from 'react-native';

import firebase from 'react-native-firebase'
//import type { Notification, NotificationOpen } from 'react-native-firebase'
import {Notification, NotificationOpen } from 'react-native-firebase'



//import formStyles from './formStyles'

import Base64 from './base64'

var _ = require('lodash');


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

const serverUrl = "https://oxlab-studio.fr/"


firebase.messaging().hasPermission()
  .then(enabled => {
    if (enabled) {
      //console.log("HAS FIREBASE PERMISSION")
      firebase.messaging().getToken()
        .then(fcmToken => {
          if (fcmToken) {
            fcmDeviceToken = fcmToken
          //console.log("FCMTOKEN = ", fcmToken)
          } else {
            // user doesn't have a device token yet
          }
        });
    } else {
      //console.log("HAS NOT FIREBASE PERMISSION")
      firebase.messaging().requestPermission()
        .then(() => {
          //console.log("HAS RECEIVED FIREBASE PERMISSION")
          // User has authorised  
        })
        .catch(error => {
          //  console.log("HAS NOT RECEIVED FIREBASE PERMISSION")
          // User has rejected permissions  
        });
    }
  });


class Fire extends React.Component {  

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalUrl: null,
	  checked: false,
	  check: 'NO'
    }
  }

  
  
_check = () => {
  
	this.setState({check: 'OK', checked: !this.state.checked })
	
}

  
  processNotif(notification) {
    //console.log(notification)
    if (notification.data.type == "paymentNotification") {
      if (notification.data.payId == this.state.payId) {
        let message = null
        if (notification.data.status == "success") {
          message = "Paiement effectué avec succés"
        } else if (notification.data.status == "aborted") {
          message = "Paiement annulé par l'utilisateur"
        } else if (notification.data.status == "error") {
          let error = JSON.parse(notification.data.error)
          message = "Une erreur est survenue\r" + error.message
        }
        if (message) {
          this.setState({
            showModal: false,
            modalUrl: null,
            message: message
          })
          firebase.messaging().unsubscribeFromTopic('/topics/' + notification.data.payId)
        }
      }
    }
  }


  componentDidMount() {
    this.notificationListener = firebase.notifications().onNotification((notification) => {
      console.log("IN APP NOTIFICATION")
      this.processNotif(notification)
    // Process your notification as required
    })
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      // Get the action triggered by the notification being opened
      const action = notificationOpen.action;
      // Get information about the notification that was opened
      const notification = notificationOpen.notification;
      console.log("FOREGROUND AND BACKGROUND NOTIFICATIONS")
      this.processNotif(notification)
    });

    firebase.notifications().getInitialNotification()
      .then((notificationOpen) => {
        if (notificationOpen) {
          // App was opened by a notification
          // Get the action triggered by the notification being opened
          const action = notificationOpen.action;
          // Get information about the notification that was opened
          const notification = notificationOpen.notification;
          console.log("CLOSED APP NOTIFICATIONS")
          this.processNotif(notification)
        }
      });
  }

  
  _initPayment = (prix, mtgs) => {

	if (this.state.check == 'NO') {
		
		alert('Cochez la case');		
		
	} else {
  
    var body = {
      'type': 'PAYSAFECARD',
      'amount': prix, 
      'currency': 'EUR',
      'idu': this.props.navigation.state.params.idu,
      'mtgs': mtgs, 
      'customer_id': Math.random() + '1234'
    }
    const config = {
      method: 'POST',
      headers: {
        //'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
    fetch(serverUrl + "paysafecard/payment/initPayment.php", config)
      .then(response => {
        //console.log("RESPONSE = ", response)
        return response.json()
      })
      .then(async json => {
        //console.log("RESULT = ", json)
        console.log("Payment id = ", json.id)
        //console.log(json.notification_url)
        if (json.status == "INITIATED") {
          firebase.messaging().subscribeToTopic('/topics/' + json.id)
          this.setState({
            showModal: true,
            modalUrl: json.redirect.auth_url,
            payId: json.id
          })
		  
		  
        } else {
          let message = null
          if (json.message) {
            message = "Une erreur est survenue \r" + json.message
          } else {
            message = "Une erreur est survenue"
          }
          this.setState({
            message: message
          })
        }
      })
      .catch(function(error) {
        console.log('There has been a problem with your fetch operation: ' + error.message)
        throw error
      })
	  
	}
  }

  render() {
	  
	  
   const items = [
	 {"prix": "10", "mtgs": "27", "img": "https://oxlab-studio.fr/mtg/images/bonusmtgpsc1.png"},
	 {"prix": "20", "mtgs": "56", "img": "https://oxlab-studio.fr/mtg/images/bonusmtgpsc2.png"},
	 {"prix": "25", "mtgs": "71", "img": "https://oxlab-studio.fr/mtg/images/bonusmtgpsc3.png"},
	 {"prix": "50", "mtgs": "145", "img": "https://oxlab-studio.fr/mtg/images/bonusmtgpsc4.png"},
	 {"prix": "100", "mtgs": "300", "img": "https://oxlab-studio.fr/mtg/images/bonusmtgpsc5.png"},
	 {"prix": "200", "mtgs": "630", "img": "https://oxlab-studio.fr/mtg/images/bonusmtgpsc6.png"},
	 {"prix": "300", "mtgs": "960", "img": "https://oxlab-studio.fr/mtg/images/bonusmtgpsc7.png"}
    ];  

	

    return (
      <View style={styles.container}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.showModal}
          onRequestClose={() => {
                            this.setState({
                              showModal: false
                            })
                          //alert('Modal has been closed.');
                          }}>
          <View style={{ paddingTop: 70 }}>
            <View style={{ width: "100%", height: "100%" }}>
              <WebView
                source={{ uri: this.state.modalUrl }}
                style={{ flex: 1 }}/>
            </View>
            <TouchableHighlight
              style={{ position: "absolute", right: 20, top: 20 }}
              onPress={() => {
                         this.setState({
                           showModal: false
                         })
                       }}>
              <Text>
                Fermer
              </Text>
            </TouchableHighlight>
          </View>
        </Modal>
        {this.state.message ?
         <View>
           <Text>
             {this.state.message}
           </Text>
           <TouchableHighlight style={{ marginTop: 20, borderWidth: 1, borderColor: "black" }}
             onPress={() => this.setState({
                        message: null
                      })}>
             <Text style={{ textAlign: "center" }}>
               {"Revennir au choix des packs"}
             </Text>
           </TouchableHighlight>
         </View>
         :
		  <View style={{ justifyContent: 'center', alignItems: 'center' , marginTop: 200}} >

		  
			   <View style={{ justifyContent: 'center', alignItems: 'center' }}>	
			   
				   <FlatList
				   
					  data={ items }
					  
					  renderItem={({item}) => {
					  
					  return (
					  
					  <TouchableOpacity onPress={this._initPayment.bind(this, item.prix, item.mtgs)}>
						<View style={{ marginBottom: 10 }}>
							<Image source = {{ uri: item.img }} style={{ width: 90, height: 21 }}></Image>
						</View>				  
					  </TouchableOpacity>
												
						 )
						
					   }
					  }
					  keyExtractor={(item, index) => index.toString()}
									  
					 />	
					
			   </View>
					

			<CheckBox
			  checked={this.state.checked}
			  onPress={this._check}
			/>			 
		
			<Text>En cochant la case, vous acceptez que les services seront fournis dès passation de la commande, ainsi vous renoncez expressément à votre droit de rétractation (article L. 221-28 du Code de la consommation).</Text>

		
         </View>}
      </View>
      );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

export default Fire