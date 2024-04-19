/* eslint-disable prettier/prettier */
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    ImageBackground,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    Button,
    Alert,
    Image
} from 'react-native';
  
import {SafeAreaView} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { color } from 'react-native-reanimated';
import SelectDropdown from 'react-native-select-dropdown';
import { Divider } from '@rneui/themed';
import Iconm from 'react-native-vector-icons/MaterialCommunityIcons';
import ReactNativeBlobUtil from 'react-native-blob-util';
import MQTT from 'sp-react-native-mqtt';
import NetInfo from "@react-native-community/netinfo";
import * as Progress from 'react-native-progress';

function RequestImageScreen({navigation}): React.JSX.Element {
    
    const [image, setImage] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [text, setText] = useState('');
    const [link, setLink] = useState('');
    const [response, setResponse] = useState('');
    const [barVisible, setBarVisible] = useState(false);
    const windowWidth = Dimensions.get('window').width;
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [sourceTypeToggler, setSourceTypeToggler] = useState(false);
    const loadedImage = require("../images/pexels-photo-1770809.jpeg");
    const countRef = useRef(response);
    countRef.current = response;

    useEffect(() => {
      NetInfo.fetch().then(state => {
        if(!state.isConnected){
          setText("Proverite vašu internet konekciju.");
          setModalVisible(true);
        }
      });
      
      MQTT.createClient({
        uri: 'mqtt://mqtt3.thingspeak.com:1883',
        clientId: 'OBYvLhc5FzE4ChswEQAXJC8',
        user: 'OBYvLhc5FzE4ChswEQAXJC8',
        pass: 'nN4J51b1GOGqcun8qXmuiahK',
        auth: true,
  
      }).then(function(client) {
      
        client.on('closed', function() {
          console.log('mqtt.event.closed');
        });
      
        client.on('error', function(msg) {
          console.log('mqtt.event.error', msg);
        });
      
        client.on('message', function(msg) {
          console.log('mqtt.event.message', msg);
          if(msg["data"] !== "IR"){
            setResponse(msg["data"]);
          }
          
        });
      
        client.on('connect', function() {
          console.log('connected');
          client.subscribe('channels/2429193/subscribe/fields/field6', 0);
        });

        client.connect();
        
      }).catch(function(err){
        console.log(err);
      });
    
    }, []);

    useEffect(() => {

      if(response !== ''){
        let reslink = response.split(' ');
        if(reslink[0] == '200'){
          setLink(reslink[1]);
          console.log('link:' + reslink[1]);
              
          ReactNativeBlobUtil.fetch('GET', reslink[1], { Authorization: 'Bearer access-token...',})
          .then((res) => {
            let status = res.info().status;
      
            if (status == 200) {
                      // the conversion is done in native code
              let base64Str = res.base64();
              setSourceTypeToggler(true);
              setImage(`data:image/png;base64,${base64Str}`);
              setBarVisible(false);
              setButtonDisabled(false);
            }
              })
              // Something went wrong:
              .catch((errorMessage, statusCode) => {
                  setText("Greška prilikom preuzimanja slike. Proverite Vašu internet konekciju.");
                  setModalVisible(true);
                  setBarVisible(false);
                  setButtonDisabled(false);
              })
    
            } else {
              setText("Greška, nije moguće povezati se sa imgur.com");
              setModalVisible(true);
              setBarVisible(false);
              setButtonDisabled(false);
            }
          }
    
    }, [response]);

    const getLink = () =>{

      fetch('https://api.thingspeak.com/update?api_key=76ATXSZ223T5OQ6D&field6=IR').then(x => x.json()).then(json => {

        if(json == 0){
          setText("Thingspeak api trenutno zauzet, pokušajte ponovo za 15 sekundi.");
          setModalVisible(true);
        } else {

          setBarVisible(true);
          setButtonDisabled(true);
          setResponse('');
          console.log("current is: " + countRef.current);

          let responsetimeout = undefined;
          if(responsetimeout !== undefined) { clearTimeout(responsetimeout); }

          responsetimeout = setTimeout(() => {
            if(countRef.current === '') {
              setText("Odgovor nije primljen, proverite da li je uređaj uključen.");
              setModalVisible(true);
              setBarVisible(false);
              setButtonDisabled(false);
            }
        
          }, 60000);
        }

      });

    };

    function saveImage(){
        let dirs = ReactNativeBlobUtil.fs.dirs;
        ReactNativeBlobUtil.config({
            // response data will be saved to this path if it has access right.
            path: dirs.LegacyDownloadDir + '/image.jpg',
        })
        .fetch('GET', link)
        .then((res) => {
            // the path should be dirs.DocumentDir + 'path-to-file.anything'
            setText("Slika je uspešno sačuvana u Vašu Downloads datoteku na uređaju.");
            setModalVisible(true);
        }).catch((errorMessage, statusCode) => {
            setText("Greška prilikom čuvanja slike. Molimo, preuzmite sliku.");
            setModalVisible(true);
        });
    }

    return (
      <SafeAreaView style={{flex:1}}>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
            <View style={styles.centeredView}>
              <LinearGradient start={{x: 0, y: 0.5}} end={{x: 0.3, y: 1.0}} colors={['rgba(2, 48, 71 ,1)', '#8ecae6']} style={styles.modalView}>
                <View style={styles.modalTextView}>
                  <Text style={styles.labela}>{text}</Text>
                </View>
                <View style={{marginTop: 21}}>
                  <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={styles.buttonStyle2}>
                    <Text style={styles.btnText}>Zatvori</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </Modal>

        <LinearGradient style={{flex:1}} start={{x: 0, y: 0.5}} end={{x: 0.3, y: 1.0}} colors={['rgba(2, 48, 71 ,0.9)', 'rgba(251, 133, 0, 0.9)']}>
            <TouchableOpacity onPress={() => navigation.navigate('home')} style={styles.buttonStyle}>
                <Iconm style={{color: 'white'}} name="keyboard-backspace" size={24} color="white" />
            </TouchableOpacity>

            <Text style={styles.title}>Zatražite sliku u polju uživo:</Text>
            <View style={styles.imageView}>
                { sourceTypeToggler ? <Image style={styles.image} source={{ uri: image}}/> : <Image style={styles.image} source={loadedImage}/>}
            </View>
            <Divider width={3} color={'#8ecae6'} />
            {barVisible ? <Progress.Bar indeterminate={true} borderWidth={0} width={windowWidth}/> : null }

            <View style={styles.buttonWrapper}>
                <TouchableOpacity style={buttonDisabled ? styles.opButton2 : styles.opButtons} onPress={() => getLink()} disabled={buttonDisabled}><Text style={styles.btnText}>Zatraži sliku</Text></TouchableOpacity>
                <TouchableOpacity style={styles.opButtons} onPress={() => saveImage()}><Text style={styles.btnText}>Sačuvaj sliku na uređaj</Text></TouchableOpacity>
            </View>
        </LinearGradient>
      </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    buttonStyle:{
        backgroundColor: '#023047',
        width: 50,
        maxHeight: 50,
        justifyContent: 'center', //Centered vertically
        alignItems: 'center', //Centered horizontally
        flex:1,
        borderRadius: 5,
    },
    imageView:{
        margin: 17,
        alignItems: 'center',
        
    },
    image:{
        height: 350,
        width: 260,
        resizeMode: 'stretch',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#8ecae6'
    },
    title:{
        fontSize: 20,
        fontFamily: 'sans-serif',
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 20,
        textShadowColor: 'black',
        textShadowRadius: 23,
        textShadowOffset: {width: -1, height: 1},
    },
    inputView:{
       alignItems: 'center',
       marginTop: 22,
    },
    labela:{
        fontSize: 15,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'black',
        textShadowRadius: 8,
        justifyContent: 'center',
        textAlign: 'center'
    
    },
    opButtons:{
        backgroundColor: '#fb8500',
        borderRadius: 10,
        margin: 10,
        height: 50,
        width: 244,
        justifyContent: 'center',
        borderColor: '#8ecae6',
        borderWidth: 2
    },
    opButton2:{
      backgroundColor: 'rgba(2, 48, 71, 0.5)',
        borderRadius: 10,
        margin: 10,
        height: 50,
        width: 244,
        justifyContent: 'center',
        borderColor: '#8ecae6',
        borderWidth: 2
    },
    btnText:{
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: 'sans-serif',
      margin: 5,
      textShadowColor: 'black',
      textShadowRadius: 10,
      textShadowOffset: {width: -0.1, height: 0.1},
      
    },
    buttonWrapper:{
        marginTop: 24,
        alignItems: 'center'
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
     
      },
      buttonStyle2:{
        backgroundColor: '#023047',
        width: 140,
        maxHeight: 50,
        justifyContent: 'center', //Centered vertically
        alignItems: 'center', //Centered horizontally
        flex:1,
        borderRadius: 5,
      },
      modalTextView:{
        justifyContent: 'center',
        alignItems: 'center'
      }
      
});

export default RequestImageScreen;