import React, { Component } from 'react';
import { Alert, BackHandler, AsyncStorage, StyleSheet, View } from "react-native";
import { Container, Header, Body, Title, Left, Right, Button, Icon, Content, H1, H2, H3, Text } from "native-base";
import { Grid, Row, Col } from "react-native-easy-grid";
import { NavigationActions, StackActions } from 'react-navigation';
import MyModal from "../components/Modal";
import EndGameModal from "../components/EndGameModal";
import SlimePet from '../components/SlimePet'
import API from "../utils/API";
import Alerts from "../utils/Alerts";
import _ from "lodash";

let modalMessage = '';

export default class HangmanScreen extends Component {
	state = {
		petInfo: {},
		difficultyLevel: "",
		gameEnded: false,
		helpModalVisible: false,
		word: [],
		blanksRemaining: 0,
		blanks: [],
		unguessed: [],
		guessedWrong: []
	};

	componentWillMount() {
		const difficultyLevel = this.props.navigation.getParam("difficultyLevel");
		const petInfo = this.props.navigation.getParam("petInfo");
		this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.showAlert);
		this.setState({
			petInfo: petInfo,
			difficultyLevel: difficultyLevel
		}, () => {
			this.startGame();
		});
	}

	startGame = () => {
		console.log("Starting game");
		API.getHangmanWord(this.state.difficultyLevel).then(res => {
			// returns an array of 100, chose one word, convert to array
			let newWord = res.data[Math.floor(Math.random() * 100)].word.toUpperCase().split('');
			const blanksList = newWord.map((letter) => {
				if (letter === " ") {
					return letter
				}
				else {
					return "_"
				}
			})
			this.setState({
				word: newWord,
				gameEnded: false,
				blanksRemaining: newWord.length,
				blanks: blanksList,
				unguessed: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
				guessedWrong: []
			});
		})
	}

	showAlert = () => {
		return Alerts.exitGame((() => this.navigate("GameLobby")))
	}

	navigate = (routeName) => {
		this.setState({ gameEnded: false }, () => {
			this.backHandler.remove();
			const navigate = NavigationActions.navigate({
				routeName: routeName
			});
			const reset = StackActions.reset({
				index: 0,
				actions: [NavigationActions.navigate({ routeName: 'GameLobby' })],
			})
			this.props.navigation.dispatch(reset);
			this.props.navigation.dispatch(navigate);
		})
	}

	playGame = (letter) => {
		let goodGuess = false;
		let newblanksRemaining = this.state.blanksRemaining;
		let newBlanks = this.state.blanks.map((blank, index) => {
			if (this.state.word[index] === letter) {
				goodGuess = true;
				newblanksRemaining--;
				return letter;
			}
			else {
				return blank;
			}
		})
		let newUnguessed = this.state.unguessed.filter((notblank) => {
			return notblank !== letter;
		})
		let newGuessedWrong = _.clone(this.state.guessedWrong);
		goodGuess ? this.state.guessedWrong : newGuessedWrong.push(letter);
		this.setState({
			blanksRemaining: newblanksRemaining,
			blanks: newBlanks,
			unguessed: newUnguessed,
			guessedWrong: newGuessedWrong
		}, () => {
			if (this.state.blanksRemaining <= 0 || this.state.guessedWrong.length >= 8) {
				this.endGame(this.state.blanksRemaining)
			}
		})
	}

	endGame = (name) => {
		const baseXP = 150;
		let winBonusXP;
		let totalXP;
		if (name <= 0) {
			switch (this.state.difficultyLevel) {
				case "easy":
					winBonusXP = 50;
					break;
				case "normal":
					winBonusXP = 150;
					break;
				case "hard":
					winBonusXP = 250;
					break;
			}
			totalXP = baseXP + winBonusXP;
		}
		else {
			totalXP = baseXP;
		}
		this.updateLevel(this.state.petInfo, totalXP);
	}

	updateLevel = (petInfo, gainedXP) => {
		const { _id, level, experiencePoints } = petInfo;
		const levelObj = { currentLevel: level, currentXP: experiencePoints, gainedXP: gainedXP };
		API.updateLevelAndXP(_id, levelObj)
			.then(res => {
				AsyncStorage.getItem("user").then(user => {
					user = JSON.parse(user);
					user.pets = user.pets.map(pet => {
						if (pet._id === res.data._id) {
							return res.data;
						}
						return pet;
					});
					AsyncStorage.setItem("user", JSON.stringify(user)).then(() => {
						this.modalMessage(level, gainedXP, res.data.level);
						this.setState({ gameEnded: true, petInfo: res.data });
					});
				}).done();
			})
			.catch(err => console.log(err));
	}

	modalMessage = (currentLevel, gainedXP, newLevel) => {
		const petName = this.state.petInfo.name
		modalMessage = this.state.blanksRemaining <= 0
			? `${petName} won! \n It has earned ${gainedXP} XP!`
			: `The word was ${this.state.word.join("")}. \n ${petName} lost! \n It still earned ${gainedXP} XP!`;
		if (currentLevel < newLevel) {
			modalMessage += `\n It is now at level ${newLevel}!`;
		}
	}




	render() {
		return (
			<Container>
				<Header>
					<Left style={{ flex: 1 }}>
						<Button transparent onPress={this.showAlert}>
							<Icon name='arrow-back' />
							<Text> To Lobby </Text>
						</Button>
					</Left>
					<Body style={{ flex: 1 }}>
						<Title>Hangman</Title>
					</Body>
					<Right style={{ flex: 1 }}>
						<Button transparent onPress={() => this.setState({ helpModalVisible: true })}>
							<Icon name='help-circle-outline' />
						</Button>
					</Right>
				</Header>
				<Content>
					<MyModal visible={this.state.helpModalVisible}>
						<Grid style={{ backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" }}>
							<Row size={1} >
								<H2 style={{ alignSelf: "center", color: "white", textAlign: "center" }}>
									Play Hangman with your pet!
								</H2>
							</Row>
							<Row size={1}>
								<Button onPress={() => this.setState({ helpModalVisible: false })}>
									<Text>Close</Text>
								</Button>
							</Row>
						</Grid>
					</MyModal>
					<EndGameModal modalMessage={modalMessage} visible={this.state.gameEnded} navigateToLobby={() => this.navigate("GameLobby")} startGame={() => this.startGame()} navigateToStable={() => this.navigate("Home")} />
					<View style={{ flex: 1, alignItems: 'center', padding: 20 }}>
						<Button transparent large style={{ alignSelf: 'center' }}
							onPress={() => { console.log("Pressed Pet") }}
						>
							<SlimePet baseColor={this.state.petInfo.baseColor} outlineColor={this.state.petInfo.outlineColor} height="70" width="70" scale="0.5" />
						</Button>
						<H2 style={{ paddingTop: 20 }}>The Magic Word:</H2>
						<H1>
							{this.state.blanks.map(blank => {
								return blank.concat(" ")
							})}
						</H1>
						<H2 style={{ paddingTop: 20 }}>Wrong Letters:</H2>
						<Row style={{ flex: 1, flexWrap: 'wrap', alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
							{this.state.guessedWrong.map(wLetter => {
								return (
									<Button key={wLetter} dark rounded small style={{ margin: 5 }}
									>
										<Text>{wLetter}</Text>
									</Button>
								)
							})}
						</Row>
						<H3 style={{ paddingTop: 20 }}>Guesses Remaining: {8 - this.state.guessedWrong.length}</H3>
						<H2 style={{ paddingTop: 20 }}>Unguessed Letters:</H2>
						<Row style={{ flex: 1, flexWrap: 'wrap', alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
							{this.state.unguessed.map(unLetter => {
								return (
									<Button key={unLetter} primary rounded small style={{ margin: 5 }}
										onPress={() => this.playGame(unLetter)}
									>
										<Text>{unLetter}</Text>
									</Button>
								)
							})}
						</Row>
					</View>
				</Content>
			</Container>
		)
	}
}