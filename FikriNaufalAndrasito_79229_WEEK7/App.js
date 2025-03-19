import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserList from "./UserPage/UserList";
import Profile from "./UserPage/Profile";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Users"
          component={UserList}
          options={{
            title: "User Directory",
          }}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={({ route }) => ({
            title: route.params.user.name,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
