import React from 'react';
import API from "../utils/API";
import { View, ScrollView, StyleSheet, AsyncStorage } from 'react-native';
import PetCard from '../components/PetCard';
import TinyPetCard from '../components/TinyPetCard';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { Button, Text } from 'native-base';
import { NavigationActions } from 'react-navigation';

export default class BreedScreen extends React.Component {
  static navigationOptions = {
    title: 'Breed',
  };

  state = {
    // holds up to 2 pets to be bred
    tobreed: [],
    // holds all users pets not in tobreed array
    pets: []
  }

  componentWillMount(){
    // get data from AsyncStorage for continuity between screens
    (async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user !== null) {
          // We have data!!
          let userInfo = JSON.parse(user);
          const petParam = this.props.navigation.getParam("pet");
          if(petParam){
            var otherPetsArray = this.filterPets( petParam, userInfo.pets );
          }
          this.setState({ pets: otherPetsArray ? otherPetsArray : userInfo.pets, tobreed: petParam ? [petParam] : [] });
        }
       } catch (error) {
         // Error retrieving data
       }
    })()
  }

  filterPets = (pet, petsArray) => {
    // make new array of pets, minus chosen pet
    const newPetsArray = petsArray.filter((onePet) => {
      if (onePet._id !== pet._id) {
        return onePet
      }
    });
    return newPetsArray;
  }

  componentWillReceiveProps = (nextProps) => {
    (async () => {
      const user = await AsyncStorage.getItem("user");
      const userInfo = JSON.parse(user);
      const petsArray = userInfo.pets
      let breedThis = nextProps.navigation.getParam('pet');
      // let otherPets = 
      if (breedThis) {
        const newPets = this.filterPets(breedThis, petsArray);
        this.setState( () => {
          return {
            pets: newPets,
            tobreed: [breedThis]
          }
        })
      }
    })()
    
  }

  petOnPress = (index) => {
    if (this.state.tobreed.length < 2) {
      this.setState(state => { 
        // get chosen pet
        const newbreeder = state.pets[index];
        // make new array of pets, minus chosen pet
        const newpets = this.filterPets(newbreeder, state.pets)
        // get current tobreed pet, if any
        // this doesn't work without slice, 
        // because React does weird things
        let breeders = state.tobreed.slice(0);
        // add new pet to breed to the array
        breeders.push(newbreeder);
        // return the new arrays to set the new state
        return { 
          tobreed: breeders,
          pets: newpets
        } 
      });
    }
  }

  breederOnPress = (index) => {
    const removebreeder = this.state.tobreed[index];
    const breedpets = this.state.tobreed.filter((pet, i) => {
      if (i !== index) {
        return pet
      }
    })
    const allpets = this.state.pets.slice(0);
    allpets.push(removebreeder);
    this.setState(() => { 
      return { 
        tobreed: breedpets,
        pets: allpets
      } 
    });
  }

  handleBreedPets = () => {
    API.breedPets({
      firstParent: this.state.tobreed[0]._id,
      secondParent: this.state.tobreed[1]._id
    })
    .then((res) => {
      console.log(res.data);
      console.log(res.data.parents[0], res.data.parents[0]);
    })
    .catch(err => console.log(err));
  }

  render() {
    return (
      <View style={styles.container}>
        <Grid>
          <Row style={{flexWrap: "wrap", justifyContent: 'space-evenly', height: 175}}>
          {this.state.tobreed.map( (breeder, index) => {
            return <Col key={breeder._id} style={{width: 150, height: 200}} >
              <PetCard key={index} data={breeder} press={() => {this.breederOnPress(index)}} 
              />
            </Col>
          })}
          </Row>
          <Row style={{justifyContent: 'center'}}>
            <Button danger rounded style={{ margin: 10}}
              onPress={ () => this.handleBreedPets() }
            > 
              <Text>Breed</Text> 
            </Button>
          </Row>
        </Grid>
        <ScrollView style={styles.container}>
          <Grid>
            <Row style={{flexWrap: "wrap", justifyContent: 'space-evenly'}} > 
              {this.state.pets.map( (pet, index) => {
                return <Col key={pet._id} style={{width: 100, height: 140}} >
                <TinyPetCard key={index} data={pet} press={() => {this.petOnPress(index)}} />
              </Col>
              })}
            </Row>
          </Grid>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});