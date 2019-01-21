import React from 'react';
import {Linking} from 'react-native';

import { Image, StyleSheet, View } from 'react-native';
import { Svg } from 'expo';
import { Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body } from 'native-base';
import { Col, Row, Grid } from "react-native-easy-grid";
import { NavigationActions } from 'react-navigation';
import { width, height } from "../constants/Layout"
const { Circle } = Svg;

export default PetScreen = (props) => {
  const param = props.navigation.getParam('pet');
  const {name, baseColor, outlineColor, gameColor, isFavorite, parents, level, experiencePoints } = param;
  const { red, blue, green, transparency } = baseColor;

  toGameLobby = (pet) => {
    const navigateToGameLobby = NavigationActions.navigate({
        routeName: "GameLobby",
        params: { pet: pet }
    });
    props.navigation.dispatch(navigateToGameLobby);
  }

  toBreedPage = (pet) => {
    const navigateToGameLobby = NavigationActions.navigate({
        routeName: "Breed",
        params: { pet: pet }
    });
    props.navigation.dispatch(navigateToGameLobby);
  }

  return (
      <Content style={styles.centeredContent}>
        <Card style={styles.centeredContent}>
          <CardItem>
              <Body>
                <View style={styles.svgContainer}>
                  <Svg
                      height="200"
                      width="200"
                  >
                      <Circle
                          cx="100"
                          cy="100"
                          r="95"
                          fill={`rgba(${red}, ${green},  ${blue}, ${transparency})`}
                          strokeWidth="3"
                          stroke={`rgba(${outlineColor.red}, ${outlineColor.green},  ${outlineColor.blue}, ${outlineColor.transparency})`}
                      />
                  </Svg>
                </View>
              </Body>
          </CardItem>
          <CardItem>
            <Body>
              <Row size={ 1 } >
                <Button success rounded style={{ margin: 10}}
                    onPress={ () => this.toGameLobby(param) }
                > 
                    <Text>Play</Text> 
                </Button>
                <Button danger rounded style={{ margin: 10}}
                    onPress={ () => this.toBreedPage(param) }
                > 
                    <Text>Breed</Text> 
                </Button>
              </Row>
              <Text style={{alignSelf: "center"}}>Name: {name}</Text>
              <Text style={{alignSelf: "center"}}>Level: {level}</Text>
              {level > 1 && <Text style={{alignSelf: "center"}}>Primary Game Color: {gameColor.primary}</Text>}
              {level > 9 && <Text style={{alignSelf: "center"}}>Secondary Game Color: {gameColor.secondary}</Text>}
              <Text style={{alignSelf: "center"}}> { parents.length > 1 ? `Parents: ${parents[0]}, ${parents[1]}` : `Parents: ${parents[0]}` }</Text>
            </Body>
          </CardItem>
        </Card>
      </Content>
  );
}

const styles = StyleSheet.create({
  nameText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,1)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  centeredContent: {
    alignContent: 'center',
    flex: 1,
  },
  svgContainer: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  }
});