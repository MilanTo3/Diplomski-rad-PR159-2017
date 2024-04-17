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
import DatePicker from 'react-native-date-picker';
import NetInfo from "@react-native-community/netinfo";
import * as Progress from 'react-native-progress';

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
  const [line2, setLine2] = useState([0]);
  const [izabranOpseg, setIzabranOpseg] = useState(-1);
  const [izabranaVelicina, setIzabranaVelicina] = useState(-1);
  const [korelisanaVelicina, setKorelisanaVelicina] = useState(-1);
  const [widthMultiplier, setWidthMultiplier] = useState(1);
  const [labelUnit, setLabelUnit] = useState("");
  const [correlationUnit, setCorrelationUnit] = useState("");
  const [pickedDate, setPickedDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState('');
  const [barVisible, setBarVisible] = useState(false);
  const windowWidth = Dimensions.get('window').width;

  const opcije = ["Temperatura", "Vlažnost vazduha", "Vlažnost zemljišta", "Kvalitet vazduha", "UV indeks"];
  const labelUnits = ["°C", "%", "%", "ppm", ""]
  const range = ["Danas", "Ove nedelje", "Ovog meseca", "Izaberite datum"];

  useEffect(() => {
    
    NetInfo.fetch().then(state => {
      if(!state.isConnected){
        setText("Proverite vašu internet konekciju.");
        setModalVisible(true);
      }
    });

  }, []);

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
        setWidthMultiplier(5);

        if (izabranOpseg === 1){
          temp.setDate(temp.getDate() - 7);
        } else if (izabranOpseg === 2){
          temp.setMonth(temp.getMonth() - 1);
        } else if (izabranOpseg === 3){
          temp.setFullYear(pickedDate.getFullYear(), pickedDate.getMonth(), pickedDate.getDate());
          today.setFullYear(pickedDate.getFullYear(), pickedDate.getMonth(), pickedDate.getDate());
          today.setHours(24);
          today.setMinutes(59);
          today.setSeconds(59);
        }

        build = build + temp.toISOString().replace('T', '%20').replace('T', '%20').substring(0, today.toISOString().indexOf('.') + 2) + "&end=" + today.toISOString().replace('T', '%20').substring(0, today.toISOString().indexOf('.') + 2);
        fetch(build).then(x => x.json()).then(json => setData1(json.feeds));
        setBarVisible(true);

        if (korelisanaVelicina !== -1){
          build = 'https://api.thingspeak.com/channels/2429193/fields/' + korelisanaVelicina.toString() + '.json?api_key=ICM2FPX89P99HRT1&start=';
          build = build + temp.toISOString().replace('T', '%20').replace('T', '%20').substring(0, today.toISOString().indexOf('.') + 2) + "&end=" + today.toISOString().replace('T', '%20').substring(0, today.toISOString().indexOf('.') + 2);
          fetch(build).then(x => x.json()).then(json => setData2(json.feeds));
          setBarVisible(true);
        }
      }
    }

  }, [izabranOpseg, izabranaVelicina, pickedDate, korelisanaVelicina]);

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
      setBarVisible(false);
      
    }
  }, [data1]);

  useEffect(() => {

    if(data2 && JSON.stringify(data2) !== '[]' && JSON.stringify(data2) !== '{}'){
      var propsToKeep = ["field" + korelisanaVelicina.toString(), "created_at"];

      var result = data2.map(item => {
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
      let field = 'field' + korelisanaVelicina.toString();
      for(let i = 0; i < result.length; i++){
        let values = result[i];
        let sum = 0;
        for(let j = 0; j < values.length; j++){
          sum = sum + Number(values[j][field]);
          
        }
        if(isNaN(sum / values.length) === false){
          finalstruct.push({avg: (sum / values.length).toFixed(1)});
        }
      }

      setLine2(finalstruct.map(x => x.avg));
      setBarVisible(false);
      
    }
  }, [data2]);

  return (
    <ScrollView style={{flex:1}}>
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

        <Text style={styles.title}>Histogram Podataka:</Text>
        <ScrollView horizontal={true} style={styles.graphView}>

        <LineChart
          data={{
            labels: line1Headers,
            datasets: [
              {
                data: line1,
                color: () => '#8ecae6',
                strokeWidth: 4
              },
              {
                data: line2,
                color: () => '#fb8500',
                strokeWidth: 4
              }
            ]
          }}
          width={Dimensions.get("window").width * widthMultiplier} // from react-native
          height={Dimensions.get('window').height/2.40}
          yAxisInterval={1} // optional, defaults to 1
          yAxisLabel={labelUnit + correlationUnit + " "}
          yLabelsOffset={20}
          renderDotContent={({x, y, indexData}) => (
            <View
              style={{
                position: 'absolute',
                top: y - 25,
                left: x - 8,
              }}>
              <Text style={[styles.labela, {fontSize: 11}]}>
                {indexData}
              </Text>
            </View>
          )}
          chartConfig={{
            
            backgroundColor: "#023047",
            backgroundGradientFrom: "#023047",
            backgroundGradientTo: "#023047",
            decimalPlaces: 1, // optional, defaults to 2dp
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            
            style: {
              borderBottomLeftRadius: 16,
              borderTopLeftRadius: 0
              
            },
            propsForDots: {
              r: "3",
              strokeWidth: "3",
              stroke: "#fb8500",
              
            },
            propsForHorizontalLabels:{
              x:60,
            },

          }}
          bezier
          style={{
            borderBottomLeftRadius: 16,
            borderTopLeftRadius: 0,
            paddingBottom: 1
          }}/>
          
        </ScrollView>
        <View style={styles.unitView}>
            <Text style={[styles.labela, {color: "#8ecae6", fontSize: 15}]}>Odabrana Veličina: {labelUnit}</Text>
            <Text style={[styles.labela, {color: "#fb8500", fontSize: 15}]}>Korelisana Veličina: {correlationUnit.replace("/", "")}</Text>
        </View>
        <Divider width={3} color={'#8ecae6'} />
        {barVisible ? <Progress.Bar indeterminate={true} borderWidth={0} width={windowWidth}/> : null }
        <DatePicker modal open={open} date={pickedDate} mode='date' maximumDate={new Date()} buttonColor='#fb8500' dividerColor='#8ecae6' title="Odaberite datum"
          onConfirm={(date) => {
            setOpen(false);
            setPickedDate(date) }}
          onCancel={() => {setOpen(false)}}/>
        <View style={styles.inputView}>
          <View style={styles.selectView}><SelectDropdown renderDropdownIcon={() => {return icon}} defaultButtonText='Izaberite vremenski opseg: ' dropdownStyle={styles.dropdownStyle}
          buttonTextStyle={styles.labela} rowStyle={styles.rowStyle} rowTextStyle={styles.labela} data={range} selectedRowStyle={styles.selectedOption} buttonStyle={styles.inputStyle}
          onSelect={(selectedItem, index) => {setIzabranOpseg(index); if (index === 3){setOpen(true);} }} buttonTextAfterSelection={(selectedItem, index) => { return selectedItem }}
          rowTextForSelection={(item, index) => {return item}}/></View>

          <View style={styles.selectView}><SelectDropdown renderDropdownIcon={() => {return icon}} defaultButtonText='Izaberite veličinu za prikaz: ' dropdownStyle={styles.dropdownStyle} buttonTextStyle={styles.labela}
          rowStyle={styles.rowStyle} rowTextStyle={styles.labela} data={opcije} selectedRowStyle={styles.selectedOption}
          buttonStyle={[styles.inputStyle, {backgroundColor: '#8ecae6'}]} onSelect={(selectedItem, index) => {setIzabranaVelicina(index + 1); setLabelUnit(labelUnits[index])}}
            buttonTextAfterSelection={(selectedItem, index) => { return selectedItem }}
            rowTextForSelection={(item, index) => {return item}}/></View>

          <View style={[styles.selectView, styles.addedPadding]}>
            <Text style={[styles.labela, styles.addedPadding]}>U korelaciji sa:</Text>
            <SelectDropdown renderDropdownIcon={() => {return icon}} defaultButtonText='Izaberite veličinu za prikaz: ' dropdownStyle={styles.dropdownStyle} buttonTextStyle={styles.labela}
          rowStyle={styles.rowStyle} rowTextStyle={styles.labela} data={opcije.filter((ele, idx) => idx !== izabranaVelicina - 1)} selectedRowStyle={styles.selectedOption}
          buttonStyle={styles.inputStyle} onSelect={(selectedItem, index) => {setKorelisanaVelicina(opcije.indexOf(selectedItem) + 1); setCorrelationUnit("/" + labelUnits[opcije.indexOf(selectedItem)])}}
            buttonTextAfterSelection={(selectedItem, index) => { return selectedItem }}
            rowTextForSelection={(item, index) => {return item}}/></View>
          
        </View>

      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  buttonStyle:{
    backgroundColor: '#023047',
    width: 50,
    height: 50,
    justifyContent: 'center', //Centered vertically
    alignItems: 'center', //Centered horizontally
    flex:1,
    borderRadius: 5,
  },
  graphView:{
    margin: 10,
    marginTop: 20,
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
  addedPadding:{
    paddingBottom: 21
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
    marginTop:22,
    alignItems: 'center'
  },
  unitView:{
    alignItems: "center"
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
    
  }

});

export default HistoryScreen;