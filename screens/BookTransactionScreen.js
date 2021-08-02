import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet,Image,TextInput,KeyboardAvoidingView,ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner'
import firebase from 'firebase'
import db from '../config'
import { enable, enabled } from 'debug';
import { text } from 'body-parser';

export default class TransactionScreen extends React.Component {
    constructor(){
        super(),
        this.state={
            buttonStatus:'normal',
            hasCameraPermissions:null,
            scanned:false,
            scannedStudentId:'',
            scannedBookId:'',
            transactionMessage:''
        }
    }
    getCameraPermissions=async(id)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermissions: status==='granted',
            buttonStatus:id,
            scanned:false
        })
    }
    handleBarCodeScanned=async({type,data})=>{
        const {buttonStatus}=this.state

        if(buttonStatus==="StudentId"){
            this.setState({
                buttonStatus:'normal',
                scanned:true,
                scannedStudentId:data
            })
        }
        else if (buttonStatus==="BookId"){
            this.setState({
                buttonStatus:'normal',
                scanned:true,
                scannedBookId:data
            })
        }
    }
    initiateBookIssue=async()=>{
        db.collection('transactions').add({
            'studentID':this.state.scannedStudentId,
            'bookID':this.state.scannedBookId,
            'data':firebase.firestore.timestamp.now().toDate(),
            'transactionType':'issue'
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            'bookAvailability':false
        })
        db.collection('students').doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
        })
    }
    initiateBookReturn=async()=>{
        db.collection('transactions').add({
            'studentID':this.state.scannedStudentId,
            'bookID':this.state.scannedBookId,
            'data':firebase.firestore.timestamp.now().toDate(),
            'transactionType':'return'
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            'bookAvailability':true
        })
        db.collection('students').doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
        })
    }
    handledTransaction=async()=>{
        var transactionMessage=null
        db.collection('books').doc(this.state.scannedBookId).get()
        .then((doc)=>{
            var book=doc.data()
            if (book.bookAvailability){
                this.initiateBookIssue()
                transactionMessage='book issued'
                ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
            }
            else {
                this.initiateBookReturn()
                transactionMessage='book returned'
                ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
            }
        })
        this.setState({
            transactionMessage:transactionMessage
        })
    }
    render() {
        const hasCameraPermissions=this.state.hasCameraPermissions;
        const scanned=this.state.scanned;
        const buttonState=this.state.buttonStatus;

        if(buttonState!=='normal' && hasCameraPermissions){
            return(
                <BarCodeScanner
                    onBarCodeScanned={scanned? undefined:this.handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                />
            )
        }
        else if(buttonState === 'normal'){
            return (
                <KeyboardAvoidingView style={styles.container} behavior='padding' enabled>
                   <View>
                        <Image 
                            source={require("../assets/booklogo.jpg")}
                            style={{width:200,height:200}}
                        />
                        <Text style={{textAlign:"center",fontSize:30}}>Wily</Text>
                   </View>
                   
                   <View style={styles.inputView}>
                        <TextInput
                            placeholder="Book Id"
                            onChangeText={text=>this.setState({
                                scannedBookId:text
                            })}
                            value={this.state.scannedBookId}
                            style={styles.inputBox}
                        />
                        <TouchableOpacity
                            style={styles.scanButton}
                            onPress={()=>{
                                this.getCameraPermissions("BookId")
                            }}>
                            <Text Style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                   </View>

                   <View style={styles.inputView}>
                        <TextInput
                            placeholder="Student Id"
                            onChangeText={text=>this.setState({
                                scannedStudentId:text
                            })}
                            value={this.state.scannedStudentId}
                            style={styles.inputBox}
                        />
                        <TouchableOpacity
                            style={styles.scanButton}
                            onPress={()=>{
                                this.getCameraPermissions("StudentId")
                            }}>
                            <Text Style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                   </View>
                   <Text style={styles.transactionAlert}>{this.state.transactionMessage}</Text>
                   <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={async()=>{ 
                        var transactionMessage = await this.handleTransaction(); 
                        this.setState({
                            scannedStudentId:'',
                            scannedBookId:''
                        })
                   }}> 
                        <Text style={styles.submitButtonText}>Submit</Text> 
                   </TouchableOpacity>
                </KeyboardAvoidingView>
              );
        }
      
    }
  }
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
        backgroundColor: '#66BB6A',
        width: 100,
        height: 50,
        borderWidth: 1.5 
    },
    submitButtonText:{
        fontSize: 20,
        textAlign: 'center',
        marginTop: 10,
        fontWeight: 'bold',
    }
 });