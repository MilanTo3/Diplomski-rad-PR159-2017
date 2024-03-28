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
import { useEffect, useState } from 'react';
import { color } from 'react-native-reanimated';
import SelectDropdown from 'react-native-select-dropdown';
import { Divider } from '@rneui/themed';
import Icon from 'react-native-vector-icons/Entypo';
import {LineChart, BarChart} from 'react-native-chart-kit';
import Iconm from 'react-native-vector-icons/MaterialCommunityIcons';

const windowWidth = Dimensions.get('window').width - 94;
const icon = <Icon style={{margin: 11, color: 'rgba(2, 48, 71 ,1)'}} name="chevron-down" size={20} color="#8ecae6" />;
function groupBy(arr, property) {
  return arr.reduce(function (memo, x) {
      if (!memo[x[property]]) { memo[x[property]] = []; }
      memo[x[property]].push(x);
      return memo;
  }, {});
};

function HistoryScreen({navigation}): React.JSX.Element {

  const [data1, setData1] = useState({});
  const [line1, setLine1] = useState([0]);
  const [line1Headers, setLine1Headers] = useState([]);
  const [data2, setData2] = useState({});
  const [line2Headers, setLine2Headers] = useState([]);
  const [izabranOpseg, setIzabranOpseg] = useState(-1);
  const [izabranaVelicina, setIzabranaVelicina] = useState(-1);
  const [widthMultiplier, setWidthMultiplier] = useState(1);
  const [labelUnit, setLabelUnit] = useState("")

  const opcije = ["Temperatura", "Vlažnost vazduha", "Vlažnost zemljišta", "Kvalitet vazduha", "UV indeks"];
  const labelUnits = ["°C ", "% ", "% ", "ppm ", ""]
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
        setWidthMultiplier(1);

        if(izabranOpseg == 1){
          temp.setDate(temp.getDate() - 7);
          setWidthMultiplier(3);

        }else if (izabranOpseg == 2){
          temp.setMonth(temp.getMonth() - 1);
          setWidthMultiplier(5);
        }

        build = build + temp.toISOString().replace('T', '%20').replace('T', '%20').substring(0, today.toISOString().indexOf('.') + 2) + "&end=" + today.toISOString().replace('T', '%20').substring(0, today.toISOString().indexOf('.') + 2);
        console.log(build);
        fetch(build).then(x => x.json()).then(json => setData1(json.feeds));
      }
    }

  }, [izabranOpseg, izabranaVelicina]);

  useEffect(() => {
    if(data1 && JSON.stringify(data1) !== '[]' && JSON.stringify(data1) !== '{}'){
      var propsToKeep = ["field" + izabranaVelicina.toString(), "created_at"];

      var result = data1.map(item => {
        const obj = {};
        for (const prop of propsToKeep) {
          obj[prop] = item[prop];
          if(prop === 'created_at'){
            obj['created_at'] = obj['created_at'].substring(5, 13);
          }
        }
        return obj;
      });

      result = groupBy(result, 'created_at');
      result = Object.values(result);
      
      let finalstruct = [];
      let field = 'field' + izabranaVelicina.toString();
      for(let i = 0; i < result.length; i++){
        let values = result[i];
        let sum = 0;
        for(let j = 0; j < values.length; j++){
          sum = sum + Number(values[j][field]);
          
        }
        if(isNaN(sum / values.length) === false){
          finalstruct.push({avg: (sum / values.length).toFixed(1), timestamp: result[i][0]['created_at']});
        }
      }

      setLine1(finalstruct.map(x => x.avg));
      setLine1Headers(finalstruct.map(x => x.timestamp.replace('T', ' ') + 'h'));
      
    }
  }, [data1]);

  return (
    <SafeAreaView style={{flex:1}}>
      <LinearGradient style={{flex:1}} start={{x: 0, y: 0.5}} end={{x: 0.3, y: 1.0}} colors={['rgba(2, 48, 71 ,0.9)', 'rgba(251, 133, 0, 0.9)']}>
        <TouchableOpacity onPress={() => navigation.navigate('home')} style={styles.buttonStyle}>
          <Iconm style={{color: 'white'}} name="keyboard-backspace" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>Histogram Podataka:</Text>
        <ScrollView horizontal={true} style={styles.graphView}>

        <BarChart
          data={{
            labels: line1Headers,
            datasets: [
              {
                data: line1
              },
            ]
          }}
          width={Dimensions.get("window").width * widthMultiplier - 20} // from react-native
          height={Dimensions.get('window').height/2.64}
          yAxisInterval={1} // optional, defaults to 1
          yAxisLabel={labelUnit}
          chartConfig={{
            backgroundColor: "#023047",
            backgroundGradientFrom: "#023047",
            backgroundGradientTo: "#023047",
            decimalPlaces: 2, // optional, defaults to 2dp
            barPercentage: 0.5,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
              
            },
            propsForDots: {
              r: "1",
              strokeWidth: "1",
              stroke: "#fb8500",
              
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}/>
          
        </ScrollView>
        <Divider width={3} color={'#8ecae6'} />
        <View style={styles.inputView}>
          <View style={styles.selectView}><SelectDropdown renderDropdownIcon={() => {return icon}} defaultButtonText='Izaberite vremenski opseg: ' dropdownStyle={styles.dropdownStyle}
          buttonTextStyle={styles.labela} rowStyle={styles.rowStyle} rowTextStyle={styles.labela} data={range} selectedRowStyle={styles.selectedOption} buttonStyle={styles.inputStyle}
          onSelect={(selectedItem, index) => {setIzabranOpseg(index)}} buttonTextAfterSelection={(selectedItem, index) => { return selectedItem }}
          rowTextForSelection={(item, index) => {return item}}/></View>

          <View style={styles.selectView}><SelectDropdown renderDropdownIcon={() => {return icon}} defaultButtonText='Izaberite veličinu za prikaz: ' dropdownStyle={styles.dropdownStyle} buttonTextStyle={styles.labela}
          rowStyle={styles.rowStyle} rowTextStyle={styles.labela} data={opcije} selectedRowStyle={styles.selectedOption}
          buttonStyle={styles.inputStyle} onSelect={(selectedItem, index) => {setIzabranaVelicina(index + 1); setLabelUnit(labelUnits[index])}}
            buttonTextAfterSelection={(selectedItem, index) => { return selectedItem }}
            rowTextForSelection={(item, index) => {return item}}/></View>
        </View>

      </LinearGradient>
    </SafeAreaView>
  );
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
  graphView:{
    margin: 10,
    marginTop: 20,
    padding: 0,
    maxHeight: Dimensions.get('window').height/2.34,
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
  inputStyle:{width: windowWidth, borderRadius: 14, backgroundColor: '#fb8500', borderColor: '#8ecae6',borderWidth: 2,},
  selectView:{
    marginTop:22
  },

  
});

export default HistoryScreen;