import React from 'react';
import {ScrollView, FlatList} from 'react-native';
import {NavigationBarIOS} from 'navigation-react-native';
import {connect} from 'react-redux';
import PersonItem from './PersonItem';

const mapStateToProps = ({people: {allIds}}) => ({ids: allIds});

const People = ({ids}) => (
  <ScrollView contentInsetAdjustmentBehavior="automatic">
    <NavigationBarIOS title="People" />
    <FlatList
      data={ids}
      keyExtractor={id => id}
      renderItem={({item}) => <PersonItem id={item} />} />
  </ScrollView>
);

export default connect(mapStateToProps)(People);
