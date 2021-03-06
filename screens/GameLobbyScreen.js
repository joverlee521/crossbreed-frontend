import React, { Component } from 'react';
import { AsyncStorage, ScrollView, View, ImageBackground, StyleSheet, StatusBar } from "react-native";
import { Container, Header, Body, Title, Content, Button, Text } from "native-base";
import { Grid, Row, Col } from "react-native-easy-grid";
import { NavigationActions } from "react-navigation";
import PetCard from "../components/Stable/PetCard";
import API from "../utils/API";

export default class GameLobbyScreen extends Component {
    constructor(props){
        super(props);
        this.state = {
            difficulty: "easy",
            userPets: [],
            selectedPet: {},
            selectedGame: "Match3Game"
        }
    }

    componentWillMount(){
        // First time this screen loads, grab all the locally stored user/pet data
        this.grabAsyncData();
    }

    componentDidMount(){
        this.props.navigation.addListener(
            "willFocus",
            () => {
                this.grabAsyncData();
            }
        )
    }

    grabAsyncData = () => {
        (async () => {
            try {
              const user = await AsyncStorage.getItem('user');
              if (user !== null) {
                // We have data!!
                let userInfo = JSON.parse(user);
                this.setState({ userPets: userInfo.pets, selectedPet: this.props.navigation.getParam("pet", userInfo.pets[0]) });
              }
             } catch (error) {
               // Error retrieving data
             }
        })()  
    }

    componentWillReceiveProps(nextProps){
        // IF the screen receives a new pet param, then set the selectedPet state to the new pet
        if(nextProps.navigation.state.params.pet){
            this.setState({ selectedPet: nextProps.navigation.getParam("pet", this.state.userPets[0])});
        }
    }

    setDifficulty = (difficultyLevel) => {
        this.setState({ difficulty: difficultyLevel });
    }

    setPet = (petInfo) => {
        this.setState({ selectedPet: petInfo });
    }

    setGame = (selectedGame) => {
        this.setState({ selectedGame: selectedGame });
    }

    startGame = () => {
        // Navigates to the actual game page, passing the difficulty and selectedPet as params
        const navigateToGame = NavigationActions.navigate({
            routeName: this.state.selectedGame,
            params: { difficultyLevel: this.state.difficulty, petInfo: this.state.selectedPet }
        });
        this.props.navigation.dispatch(navigateToGame);
    }

    render(){
        return (
            <Container>
                <StatusBar hidden />
                <ImageBackground style={ styles.imgBackground }
                 resizeMode='cover' 
                 source={require('../assets/images/background.png')}>
                <Header style={{ backgroundColor: "transparent", borderBottomWidth: 0, elevation: 0 }}>
        	        <Body>
        	          <Title style={{ color: "black", alignSelf: "center" }}>Game Lobby</Title>
        	        </Body>
        	    </Header>
                <View style={{ flex: 1 }}>
                    <Grid style={{ alignItems: "center", flex: 1 }}>
                        <Row size={ 1 } style={{ marginTop: 10 }}>
                            <Button rounded info style={{ margin: 20, alignSelf: "center" }} 
                                onPress={ () => this.startGame() }
                            >
                                <Text>Start Game</Text>
                            </Button>
                        </Row>
                        <Row size={ 1 }>
                            <Text style={{ marginTop: 15 }}> Choose a difficulty level: </Text>
                        </Row>
                        <Row size={ 1 } >
                            <Button success bordered={ this.state.difficulty === "easy" ? false : true } rounded style={{ margin: 10, marginTop: 5 }}
                                onPress={ () => this.setDifficulty("easy") }
                            > 
                                <Text>Easy</Text> 
                            </Button>
                            <Button primary bordered={ this.state.difficulty === "normal" ? false : true } rounded style={{ margin: 10, marginTop: 5}}
                                onPress={ () => this.setDifficulty("normal") }
                            > 
                                <Text>Normal</Text> 
                            </Button>
                            <Button danger bordered={ this.state.difficulty === "hard" ? false : true } rounded style={{ margin: 10, marginTop: 5}}
                                onPress={ () => this.setDifficulty("hard") }
                            > 
                                <Text>Hard</Text> 
                            </Button>
                        </Row>
                        <Row size={ 1 }>
                            <Text style={{ marginTop: 15 }}>Choose a game: </Text>
                        </Row>
                        <Row size={ 1 }>
                            <Button dark bordered={ this.state.selectedGame === "Match3Game" ? false : true }style={{ margin: 10, marginTop: 5 }}
                                onPress={ () => this.setGame("Match3Game")}
                            >
                                <Text>Match 3</Text>
                            </Button>
                            <Button dark bordered={ this.state.selectedGame === "HangmanGame" ? false : true }style={{ margin: 10, marginTop: 5 }}
                                onPress={ () => this.setGame("HangmanGame") }
                            >
                                <Text>Hangman</Text>
                            </Button>
                        </Row>
                        <Row size={ 1 }>
                            <Text style={{ marginTop: 15 }}> Choose a Pet: </Text>
                        </Row>
                    </Grid>
                        <ScrollView style={{ flex: 1 }}>
                            <Row style={{ flexWrap: "wrap", justifyContent: 'space-evenly' }} > 
                              {this.state.userPets.map( (stall, index) => {
                                const borderColor = this.state.selectedPet._id === stall._id ? "grey" : "transparent"
                                return (<Col key={stall._id} style={{width: 150, borderWidth: 5, borderColor: borderColor }} >
                                  <PetCard key={index} data={stall} press={() => this.setPet(stall) } />
                                </Col>)
                              })}
                            </Row>
                        </ScrollView>
                    
                </View>
                </ImageBackground>
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1
    },
    imgBackground: {
      width: '100%',
      height: '100%',
      flex: 1 
    },
  });