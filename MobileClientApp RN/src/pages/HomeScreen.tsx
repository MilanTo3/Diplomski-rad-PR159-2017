/* eslint-disable prettier/prettier */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    ImageBackground,
    TouchableOpacity,
    Modal,
    Animated
  } from 'react-native';
  
  import React, { useEffect, useState, useRef } from 'react';
  import {SafeAreaView} from 'react-native-safe-area-context';
  import { Divider } from '@rneui/themed';
  import LinearGradient from 'react-native-linear-gradient';
  import Icon from 'react-native-vector-icons/Entypo';
  import Iconk from 'react-native-vector-icons/FontAwesome6';
  import Iconm from 'react-native-vector-icons/MaterialCommunityIcons';
  import Collapsible from 'react-native-collapsible';
  
  import { Table, TableWrapper, Row, Rows } from 'react-native-table-component';
  import mqtt from 'precompiled-mqtt';
  
  const toFahrenheit = function (celsius){
    let fahren = (9/5 * celsius) + 32;
    return fahren;
  };
  
   function HomeScreen(): React.JSX.Element {
  
    const imgsrc = {uri: 'https://img.freepik.com/free-photo/sunny-meadow-landscape_1112-134.jpg?size=626&ext=jpg&ga=GA1.1.2008272138.1708732800&semt=ais'};
    
    const [tempCollapsed, tempCollapse] = useState(true);
    const [airHCollapsed, airHCollapse] = useState(true);
    const [soilHCollapsed, soilHCollapse] = useState(true);
    const [airQCollapsed, airQCollapse] = useState(true);
    const [uvCollapsed, uvCollapse] = useState(true);
  
    const [airQModalVisible, setairQModalVisible] = useState(false);
    const [uvModalVisible, setUVModalVisible] = useState(false);
    const [ttData, setttData] = useState({ temperature: 0, airH: '0', airQ: '0', soilH: '0', uvIndex: '0', createdAt: '' });
  
    const airstate = {
      tableHead: ['Indeks:', 'Kvalitet Vazduha:'],
      tableData: [
        ['0 - 33', 'Veoma dobar'],
        ['34 - 66', 'Dobar'],
        ['67 - 99', 'Prihvatljiv'],
        ['100 - 149', 'Loš'],
        ['150 - 200', 'Veoma Loš'],
        ['201 +', 'Izuzetno Loš']
      ]
    };
  
    const uvstate = {
      tableHead: ['UV Indeks:', 'Opis zračenja:'],
      tableData: [
        ['0 - 2', 'Nisko zračenje'],
        ['3 - 5', 'Umereno zračenje'],
        ['6 - 7', 'Visoko zračenje'],
        ['8 - 10', 'Veoma visoko zračenje'],
        ['11 +', 'Ekstremno zračenje']
      ]
    };
  
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const fadeIn = () => {
      // Will change fadeAnim value to 1 in 5 seconds
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        delay:100
      }).start();
    };
  
    useEffect(() => {
  
      const interval = setInterval(function() {
        fetch('https://api.thingspeak.com/channels/2429193/feeds.json?api_key=ICM2FPX89P99HRT1&results=1&timezone=Europe/Belgrade').then(x => x.json()).then(k => console.log(k));
        fetch('https://api.thingspeak.com/channels/2429193/feeds.json?api_key=ICM2FPX89P99HRT1&results=1&timezone=Europe/Belgrade').then(x => x.json()).then(json => setttData({temperature: Number(json.feeds[0].field1), airH: json.feeds[0].field2, airQ: json.feeds[0].field4, soilH: json.feeds[0].field3, uvIndex: json.feeds[0].field5, createdAt: json.feeds[0].created_at}));
        console.log('here3');
        fadeAnim.resetAnimation();
        fadeIn();
  
      }, 15000);
  
  
      return () => clearInterval(interval);
    });
  
    return (
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={{backgroundColor: 'black'}}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={airQModalVisible}
          onRequestClose={() => {
            setairQModalVisible(!airQModalVisible);
          }}>
            <View style={styles.centeredView}>
              <LinearGradient start={{x: 0, y: 0.5}} end={{x: 0.3, y: 1.0}} colors={['rgba(2, 48, 71 ,1)', '#8ecae6']} style={styles.modalView}>
                <View style={styles.container}>
                  <Table borderStyle={{borderWidth: 2}}>
                    <Row data={airstate.tableHead} flexArr={[1, 1]} style={styles.head} textStyle={styles.text}/>
                    <TableWrapper style={styles.wrapper}>
                      <Rows data={airstate.tableData} flexArr={[1, 1]} style={styles.row} textStyle={styles.text}/>
                    </TableWrapper>
                  </Table>
                </View>
                <View style={{marginTop: 21}}>
                  <TouchableOpacity onPress={() => setairQModalVisible(!airQModalVisible)} style={styles.buttonStyle}>
                    <Text style={styles.btnText}>Zatvori</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </Modal>
  
          <Modal
          animationType="slide"
          transparent={true}
          visible={uvModalVisible}
          onRequestClose={() => {
            setUVModalVisible(!uvModalVisible);
          }}>
            <View style={styles.centeredView}>
              <LinearGradient start={{x: 0, y: 0.5}} end={{x: 0.3, y: 1.0}} colors={['rgba(2, 48, 71 ,1)', '#8ecae6']} style={styles.modalView}>
                <View style={styles.container}>
                  <Table borderStyle={{borderWidth: 2}}>
                    <Row data={uvstate.tableHead} flexArr={[1, 1]} style={styles.head} textStyle={styles.text}/>
                    <TableWrapper style={styles.wrapper}>
                      <Rows data={uvstate.tableData} flexArr={[1, 1]} style={styles.uvrow} textStyle={styles.text}/>
                    </TableWrapper>
                  </Table>
                </View>
                <View style={{marginTop: 21}}>
                  <TouchableOpacity onPress={() => setUVModalVisible(!uvModalVisible)} style={styles.buttonStyle}>
                    <Text style={styles.btnText}>Zatvori</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </Modal>
  
            <ImageBackground source={imgsrc} resizeMode="cover">
              <LinearGradient start={{x: 0, y: 0.3}} end={{x: 0.2, y: 0.8}} colors={['rgba(251, 133, 0, 0.8)', 'rgba(2, 48, 71 ,0.7)']}>
                <Text style={styles.title}>Prikaz Telemetrijskih Podataka:</Text>
                <View style={styles.partWrapper}>
  
                  <LinearGradient start={{x: 0, y: 0}} end={{x: 0.3, y: 1.0}} colors={['rgba(255, 183, 3 ,1)', 'rgba(251, 133, 0, 1)']} style={styles.kartica}>
                    <Text style={styles.title1}>Novi Sad,</Text>
                    <View style={styles.iconStyle}>
                      <Icon style={{margin: 11, color: 'rgba(2, 48, 71 ,1)'}} name="location" size={27} color="#8ecae6" />
                    </View>
                    <Text style={styles.title1}>Kupinovo</Text>
                  </LinearGradient>
  
                  <LinearGradient start={{x: 0, y: 0}} end={{x: 0.3, y: 1.0}} colors={['rgba(255, 183, 3 ,1)', 'rgba(251, 133, 0, 1)']} style={styles.kartica}>
                    <Text style={styles.title3}>Signal:</Text>
                    <View style={styles.iconStyle}>
                      <Icon style={{margin: 11, color: 'rgba(2, 48, 71 ,1)'}} name="signal" size={27} color="#8ecae6" />
                    </View>
                    <Text style={styles.title3}>Dobar</Text>
                  </LinearGradient>
  
                </View>
                <Text style={styles.title2}>Poslednje ažurirano: </Text>
                <Animated.View style={[{opacity: fadeAnim}]}>
                  <Text style={styles.title2}>{ttData.createdAt.replace('T', ' ').replaceAll('-', '.').replace('+01:00', '')}</Text>
                </Animated.View>
  
            </LinearGradient>
            </ImageBackground>
  
            <Divider width={3} color={'#8ecae6'} />
  
            <LinearGradient start={{x: 0, y: 0.5}} end={{x: 0.3, y: 1.0}} colors={['rgba(2, 48, 71 ,0.9)', 'rgba(251, 133, 0, 0.9)']}>
  
              <LinearGradient start={{x: 1, y: 1}} end={{x: 0.0, y: 0.4}} colors={['#8ecae6', 'rgba(251, 133, 0, 1)']} style={styles.lineKartica}>
                <TouchableOpacity onPress={() => tempCollapse(!tempCollapsed)}>
                  <Collapsible collapsed={tempCollapsed} collapsedHeight={30}>
                      { tempCollapsed ? <View style={styles.headerKartica}>
                        <Iconk style={{color: 'rgba(2, 48, 71 ,1)', margin: 3}} name="temperature-low" size={24} color="black" />
                        <Text style={styles.labela}>Temperatura:</Text>
                        <Animated.View style={[{opacity: fadeAnim}]}>
                          <Text style={styles.labela}>{ttData.temperature} °C</Text>
                        </Animated.View>
                      </View> : null }
  
                      { tempCollapsed ?
                      null :
                      <View style={styles.spreadView}>
                        <View style={styles.iconStyle}>
                          <Iconk style={{margin: 11, color: 'rgba(2, 48, 71 ,1)'}} name="temperature-low" size={40} color="black" />
                        </View>
                        <View style={styles.spreadViewRightPart}>
                          <Text style={styles.labela}>Temperatura:</Text>
                          <Animated.View style={[{opacity: fadeAnim}]}>
                            <Text style={styles.labelaBigger}>{ttData.temperature} °C / <Text style={styles.labelaBigger}>{toFahrenheit(ttData.temperature)} °F</Text></Text>
                          </Animated.View>
                        </View>
                      </View>
                      }
                  </Collapsible>
                </TouchableOpacity>
              </LinearGradient>
  
              <LinearGradient start={{x: 1, y: 1}} end={{x: 0.0, y: 0.4}} colors={['#8ecae6', 'rgba(251, 133, 0, 1)']} style={styles.lineKartica}>
                <TouchableOpacity onPress={() => airHCollapse(!airHCollapsed)}>
                  <Collapsible collapsed={airHCollapsed} collapsedHeight={30}>
                      { airHCollapsed ? <View style={styles.headerKartica}>
                        <Iconm style={{color: 'rgba(2, 48, 71 ,1)'}} name="cloud" size={24} color="black" />
                        <Text style={styles.labela}>Vlažnost Vazduha:</Text>
                        <Animated.View style={[{opacity: fadeAnim}]}>
                          <Text style={styles.labela}>{ttData.airH} %</Text>
                        </Animated.View>
                      </View> : null}
  
                      { airHCollapsed ?
                      null :
                      <View style={styles.spreadView}>
                        <View style={styles.iconStyle}>
                          <Iconm style={{margin: 11, color: 'rgba(2, 48, 71 ,1)'}} name="cloud" size={40} color="black" />
                        </View>
                        <View style={styles.spreadViewRightPart}>
                          <Text style={styles.labela}>Vlažnost vazduha:</Text>
                          <Text style={styles.labela}>[Relativna]</Text>
                          <Animated.View style={[{opacity: fadeAnim}]}>
                            <Text style={styles.labelaBigger}>{ttData.airH} %</Text>
                          </Animated.View>
                        </View>
                      </View>
                      }
                  </Collapsible>
                </TouchableOpacity>
              </LinearGradient>
  
              <LinearGradient start={{x: 1, y: 1}} end={{x: 0.0, y: 0.4}} colors={['#8ecae6', 'rgba(251, 133, 0, 1)']} style={styles.lineKartica}>
                <TouchableOpacity onPress={() => soilHCollapse(!soilHCollapsed)}>
                  <Collapsible collapsed={soilHCollapsed} collapsedHeight={30}>
                      { soilHCollapsed ? <View style={styles.headerKartica}>
                        <Iconk style={{color: 'rgba(2, 48, 71 ,1)'}} name="glass-water-droplet" size={24} color="black" />
                        <Text style={styles.labela}>Vlažnost Zemljišta:</Text>
                        <Animated.View style={[{opacity: fadeAnim}]}>
                          <Text style={styles.labela}>{ttData.soilH} %</Text>
                        </Animated.View>
                      </View> : null}
  
                      { soilHCollapsed ?
                      null :
                      <View style={styles.spreadView}>
                        <View style={styles.iconStyle}>
                          <Iconk style={{margin: 10, color: 'rgba(2, 48, 71 ,1)'}} name="glass-water-droplet" size={40} color="black" />
                        </View>
                        <View style={styles.spreadViewRightPart}>
                          <Text style={styles.labela}>Vlažnost Zemljišta:</Text>
                          <Animated.View style={[{opacity: fadeAnim}]}>
                            <Text style={styles.labelaBigger}>{ttData.soilH} %</Text>
                          </Animated.View>
                        </View>
                      </View>
                      }
                  </Collapsible>
                </TouchableOpacity>
              </LinearGradient>
  
              <LinearGradient start={{x: 1, y: 1}} end={{x: 0.0, y: 0.4}} colors={['#8ecae6', 'rgba(251, 133, 0, 1)']} style={styles.lineKartica}>
                <TouchableOpacity onPress={() => airQCollapse(!airQCollapsed)}>
                  <Collapsible collapsed={airQCollapsed} collapsedHeight={30}>
                      { airQCollapsed ? <View style={styles.headerKartica}>
                        <Icon style={{color: 'rgba(2, 48, 71 ,1)'}} name="air" size={24} color="black" />
                        <Text style={styles.labela}>Kvalitet Vazduha:</Text>
                        <Animated.View style={[{opacity: fadeAnim}]}>
                          <Text style={styles.labela}>{ttData.airQ} [ppm]</Text>
                        </Animated.View>
                      </View> : null}
  
                      { airQCollapsed ?
                      null :
                      <View>
                        <View style={styles.spreadView}>
                          <View style={styles.iconStyle}>
                            <Icon style={{margin: 10, color: 'rgba(2, 48, 71 ,1)'}} name="air" size={40} color="black" />
                          </View>
                          <View style={styles.spreadViewRightPart}>
                            <Text style={styles.labela}>Kvalitet Vazduha:</Text>
                            <Animated.View style={[{opacity: fadeAnim}]}>
                              <Text style={styles.labelaBigger}>{ttData.airQ} [ppm]</Text>
                            </Animated.View>
                            <Text style={styles.labela}>[Prihvatljiv]</Text>
                          </View>
                        </View>
                        <Divider width={3} color={'#8ecae6'} />
                        
                        <View style={styles.infoTextWrapper}>
                          <Text style={styles.infoText}>Mera kvaliteta vazduha iskazana je u [Parts per million], označava milioniti deo jedne celine. U vazduhu, to su čestice zagađivača. Države koriste različite jedinice za meru kvaliteta vazduha i propisuju indekse kvaliteta vazduha. U ovom projektu biće korišćen standard koje je propisalo ministarstvo zaštite životne sredine Australije:</Text>
                          <TouchableOpacity onPress={() => setairQModalVisible(true)} style={styles.buttonStyle}>
                            <Text style={styles.btnText}>Info</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      }
                  </Collapsible>
                </TouchableOpacity>
              </LinearGradient>
  
              <LinearGradient start={{x: 1, y: 1}} end={{x: 0.0, y: 0.4}} colors={['#8ecae6', 'rgba(251, 133, 0, 1)']} style={styles.lineKartica}>
                <TouchableOpacity onPress={() => uvCollapse(!uvCollapsed)}>
                  <Collapsible collapsed={uvCollapsed} collapsedHeight={30}>
                      { uvCollapsed ? <View style={styles.headerKartica}>
                        <Iconm style={{color: 'rgba(2, 48, 71 ,1)'}} name="sun-wireless" size={24} color="black" />
                        <Text style={styles.labela}>UV indeks:</Text>
                        <Animated.View style={[{opacity: fadeAnim}]}>
                          <Text style={styles.labela}>{ttData.uvIndex}</Text>
                        </Animated.View>
                      </View> : null}
  
                      { uvCollapsed ?
                      null :
                      <View>
                        <View style={styles.spreadView}>
                          <View style={styles.iconStyle}>
                            <Iconm style={{margin: 10, color: 'rgba(2, 48, 71 ,1)'}} name="sun-wireless" size={40} color="black" />
                          </View>
                          <View style={styles.spreadViewRightPart}>
                            <Text style={styles.labela}>UV indeks:</Text>
                            <Animated.View style={[{opacity: fadeAnim}]}>
                              <Text style={styles.labelaBigger}>{ttData.uvIndex}</Text>
                            </Animated.View>
                          </View>
                        </View>
  
                        <Divider width={3} color={'#8ecae6'} />
                        <View style={styles.infoTextWrapper}>
                          <Text style={styles.infoText}>Sunčevo zračenje je važan prirodni faktor jer formira klimu na Zemlji i ima značajan uticaj na životnu sredinu. Ultraljubičasti deo sunčevog spektra (UV) ima važnu ulogu u procesima u biosferi. U ovom projektu posmatraju se UV-A [315-400nm] i UV-B [280-315nm] opsezi zračenja. Propisan je međunarodni standard za opis nivoa ultraljubičastog zračenja:</Text>                      
                          <TouchableOpacity onPress={() => setUVModalVisible(true)} style={styles.buttonStyle}>
                            <Text style={styles.btnText}>UV indeks</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      }
                  </Collapsible>
                </TouchableOpacity>
              </LinearGradient>
              <Divider width={3} color={'#8ecae6'} />
              
            </LinearGradient>
        </ScrollView>
    );
  }
  
  const styles = StyleSheet.create({
    sectionContainer: {
      marginTop: 32,
      paddingHorizontal: 24,
    },
    kartica:{
      width: '41%',
      padding: 14,
      margin: 10,
      borderRadius: 20,
      borderColor: 'rgba(2, 48, 71 ,0.9)',
      borderWidth: 2,
  
    },
    title:{
      fontSize: 20,
      fontFamily: 'sans-serif',
      color: 'white',
      textAlign: 'center',
      fontWeight: 'bold',
      marginTop: 24,
      textShadowColor: 'black',
      textShadowRadius: 23,
      textShadowOffset: {width: -1, height: 1},
  
    },
    cardWrapper:{
      flexDirection: 'row',
      justifyContent: 'center',
  
    },
    titleWrapper:{
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 19,
  
    },
    title1:{
      textAlign:'center',
      fontSize: 18,
      color: 'white',
      fontFamily: 'serif',
      textShadowColor: '#023047',
      textShadowRadius: 10
    },
    title2:{
      textAlign:'center',
      fontSize: 16,
      color: 'white',
      fontFamily: 'serif',
      fontWeight: 'bold',
      textShadowColor: '#023047',
      textShadowRadius: 20
  
    },
    title3:{
      textAlign:'center',
      fontSize: 18,
      color: 'white',
      fontFamily: 'serif',
      textShadowColor: '#023047',
      textShadowRadius: 10
    },
    linearGradient: {
      paddingLeft: 10,
      paddingRight: 10,
      borderRadius: 5,
      
    },
    partWrapper:{
      flexDirection: 'row',
      justifyContent:'center',
      padding: 15,
      paddingBottom: 25,
      paddingTop: 25
    },
    labela:{
      fontSize: 16,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: 'white',
      textShadowColor: 'black',
      textShadowRadius: 10,
  
    },
    lineKartica:{
      borderRadius: 15,
      borderColor: 'black',
      borderWidth: 1.5,
      margin: 15,
      padding: 7,
    },
    iconStyle:{
      borderRadius: 50,
      borderColor: '#023047',
      borderWidth: 2,
      alignSelf: 'center',
      margin: 4,
      backgroundColor: '#8ecae6'
    },
    headerKartica:{
      flexDirection:'row',
      justifyContent: 'space-between',
    },
    spreadView:{
      flexDirection: 'row',
      justifyContent: 'space-between',
      margin: 5,
      marginRight: 25,
      marginLeft: 25
  
    },
    spreadViewRightPart:{
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: 4,
    },
    labelaBigger:{
      margin: 4,
      fontSize: 20,
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
      color: 'white',
      textShadowColor: 'black',
      textShadowRadius: 10,
  
    },
    infoText:{
      margin: 5,
      fontSize: 14,
      color: 'white',
      fontWeight: 'bold',
      textShadowColor: 'black',
      textShadowRadius: 5,
      textAlign: 'center',
  
    },
    infoTextWrapper:{
      backgroundColor: "#023047",
      borderBottomLeftRadius: 14,
      borderBottomRightRadius: 14,
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
    buttonStyle:{
      margin: 7,
      backgroundColor: '#841584',
      width: 100,
      borderRadius: 13,
      padding: 7
    },
    btnText:{
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    container: { backgroundColor: '#fff', width: 225 },
    head: { height: 50, backgroundColor: '#f1f8ff' },
    row: { height: 28 },
    uvrow: { height: 43 },
    text: { margin: 2, textAlign: 'center', fontWeight: 'bold' },
    wrapper: { flexDirection: 'row' },
    titlek: { flex: 1, backgroundColor: '#f6f8fa' },
  
  });
  
  export default HomeScreen;