/* eslint-disable prettier/prettier */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

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
  Dimensions
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart } from 'react-native-gifted-charts';
import { useEffect, useState } from 'react';
import { color } from 'react-native-reanimated';
import SelectDropdown from 'react-native-select-dropdown';
import { Divider } from '@rneui/themed';
import Icon from 'react-native-vector-icons/Entypo';

const windowWidth = Dimensions.get('window').width - 94;
const icon = <Icon style={{margin: 11, color: 'rgba(2, 48, 71 ,1)'}} name="chevron-down" size={20} color="#8ecae6" />;

function HistoryScreen({navigation}): React.JSX.Element {

  const data = [ {value:50}, {value:80}, {value:90}, {value:70} ];
  const [data1, setData1] = useState({});
  const [data2, setData2] = useState({});
  const [izabranOpseg, setIzabranOpseg] = useState(-1);
  const [izabranaVelicina, setIzabranaVelicina] = useState(-1);

  const opcije = ["Temperatura", "Vlažnost vazduha", "Vlažnost zemljišta", "Kvalitet vazduha", "UV indeks"];
  const range = ["Danas", "Ove nedelje", "Ovog meseca"];

  useEffect(() => {

    if (navigation.isFocused){
      let build = '';

      if(izabranOpseg !== -1 && izabranaVelicina !== -1){
        build = 'https://api.thingspeak.com/channels/2429193/fields/' + izabranaVelicina.toString() + '.json?api_key=ICM2FPX89P99HRT1&start=';
        
        let today = new Date();
        today.setHours(today.getHours() + 1);
        let temp = new Date();

        temp.setHours(1);
        temp.setMinutes(0);
        temp.setSeconds(1);

        if(izabranOpseg == 1){
          temp.setDate(temp.getDate() - 7);
        }else if (izabranOpseg == 2){
          temp.setMonth(temp.getMonth() - 1);
        }

        build = build + temp.toISOString().replace('T', '%20').replace('T', '%20').substring(0, today.toISOString().indexOf('.') + 2) + "&end=" + today.toISOString().replace('T', '%20').substring(0, today.toISOString().indexOf('.') + 2);
        console.log(build);
        fetch(build).then(x => x.json()).then(json => setData1(json.feeds));
      }
    }

  }, [izabranOpseg, izabranaVelicina]);

  useEffect(() => {
    console.log(data1);
  }, [data1]);

  return (
    <SafeAreaView style={{flex:1}}>
      <LinearGradient style={{flex:1}} start={{x: 0, y: 0.5}} end={{x: 0.3, y: 1.0}} colors={['rgba(2, 48, 71 ,0.9)', 'rgba(251, 133, 0, 0.9)']}>
        <TouchableOpacity onPress={() => navigation.navigate('home')} style={styles.buttonStyle}>
          <Text style={styles.btnText}> ← </Text>
        </TouchableOpacity>

        <Text style={styles.title}>Histogram Podataka:</Text>
        <View style={styles.graphView}>
          <LineChart data = {data} yAxisTextStyle={{color: '#fb8500'}} 
                     width={windowWidth} startFillColor1='rgba(2, 48, 71 ,0.9)' color1='#fb8500'
                     backgroundColor={'#023047'} dataPointsColor1={'#8ecae6'} isAnimated={true}
                     animateOnDataChange={true} onDataChangeAnimationDuration={1500} dataPointsShape1=''/>
        </View>
        <Divider width={3} color={'#8ecae6'} />
        <View style={styles.inputView}>
          <View style={styles.selectView}><SelectDropdown renderDropdownIcon={() => {return icon}} defaultButtonText='Izaberite vremenski opseg: ' dropdownStyle={styles.dropdownStyle}
          buttonTextStyle={styles.labela} rowStyle={styles.rowStyle} rowTextStyle={styles.labela} data={range} selectedRowStyle={styles.selectedOption} buttonStyle={styles.inputStyle}
          onSelect={(selectedItem, index) => {setIzabranOpseg(index)}} buttonTextAfterSelection={(selectedItem, index) => { return selectedItem }}
          rowTextForSelection={(item, index) => {return item}}/></View>

          <View style={styles.selectView}><SelectDropdown renderDropdownIcon={() => {return icon}} defaultButtonText='Izaberite veličinu za prikaz: ' dropdownStyle={styles.dropdownStyle} buttonTextStyle={styles.labela}
          rowStyle={styles.rowStyle} rowTextStyle={styles.labela} data={opcije} selectedRowStyle={styles.selectedOption}
          buttonStyle={styles.inputStyle} onSelect={(selectedItem, index) => {setIzabranaVelicina(index + 1)}}
            buttonTextAfterSelection={(selectedItem, index) => { return selectedItem }}
            rowTextForSelection={(item, index) => {return item}}/></View>
        </View>

      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonStyle:{
    margin: 7,
    backgroundColor: '#841584',
    width: 50,
    borderRadius: 13,
    padding: 7
  },
  btnText:{
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  graphView:{
    margin: 10,
    marginTop: 24,
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

  },
  selectedOption:{
    backgroundColor: '#fb8500'
  },
  dropdownStyle:{
    borderRadius: 20, borderBlockColor: 'black', borderWidth: 1,
  },
  rowStyle:{backgroundColor: '#8ecae6', borderBlockColor: '#023047'},
  inputStyle:{width: windowWidth, borderRadius: 14, backgroundColor: '#fb8500', borderColor: '#8ecae6',
  borderWidth: 2,},
  selectView:{
    marginTop:22
  }

  
});

export default HistoryScreen;