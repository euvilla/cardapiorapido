import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function App() {
  const [menu, setMenu] = useState([
    { id: "1", name: "Hamburguer Tradicional", price: 11 },
    { id: "2", name: "Hamburguer de Calabresa", price: 15 },
    { id: "3", name: "Hamburguer de Bacon", price: 17 },
    { id: "4", name: "Hamburguer Caseiro", price: 15 },
    { id: "5", name: "Cheddar", price: 16 },
    { id: "6", name: "X BACON", price: 19 },
    { id: "7", name: "Pastel Tradicional", price: 4 },
    { id: "8", name: "Hot Dog Simples", price: 10 },
    { id: "9", name: "Hot Dog a Moda da Casa", price: 14 },
    { id: "10", name: "BATATA FRITA COM CHEDDAR", price: 23 },
    { id: "11", name: "BATATA FRITA COM CHEDDAR E BACON", price: 26 },
    { id: "12", name: "REFRIGERANTE 2 L", price: 12 },
    { id: "13", name: "REFRIGERANTE 1 L", price: 8 },
    { id: "14", name: "Copo de suco", price: 3 }
  ]);

  const [clients, setClients] = useState([]);
  const [currentClient, setCurrentClient] = useState("");
  const [order, setOrder] = useState([]);
  const [total, setTotal] = useState(0);
  const [dailyHistory, setDailyHistory] = useState([]);
  const scrollViewRef = useRef(null);

  const addToOrder = (item) => {
    const existingItem = order.find((orderItem) => orderItem.id === item.id);
    if (existingItem) {
      setOrder(
        order.map((orderItem) =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        )
      );
    } else {
      setOrder([...order, { ...item, quantity: 1 }]);
    }
    setTotal(total + item.price);
  };

  const saveOrderForClient = () => {
    if (!currentClient.trim()) return alert("Insira o nome ou número da mesa!");

    const newOrder = { name: currentClient, order: [...order], total };

    setClients([...clients, newOrder]);
    setDailyHistory([...dailyHistory, newOrder]);

    setOrder([]);
    setTotal(0);
    setCurrentClient("");
  };

  const markAsReady = (clientIndex) => {
    setClients(clients.filter((_, index) => index !== clientIndex));
  };

  const resetOrders = () => {
    setOrder([]);
    setClients([]);
    setTotal(0);
    setCurrentClient("");
  };

  const clearDailyHistory = () => {
    setDailyHistory([]);
    alert("Histórico diário foi zerado.");
  };

  const exportDailyHistory = async () => {
    if (dailyHistory.length === 0) {
      Alert.alert("Histórico vazio", "Nenhum pedido registrado no histórico.");
      return;
    }

    const fileUri = FileSystem.documentDirectory + "historico_diario.txt";

    const fileContent = dailyHistory
      .map((record, index) => {
        const orderDetails = record.order
          .map(
            (item) =>
              `    - ${item.name} (x${item.quantity}) - R$ ${(item.quantity * item.price).toFixed(
                2
              )}`
          )
          .join("\n");
        return `Pedido ${index + 1}\nCliente: ${record.name}\nTotal: R$ ${record.total.toFixed(
          2
        )}\nItens:\n${orderDetails}\n\n`;
      })
      .join("\n");

    try {
      await FileSystem.writeAsStringAsync(fileUri, fileContent);

      await Sharing.shareAsync(fileUri, {
        mimeType: "text/plain",
        dialogTitle: "Exportar Histórico Diário",
        UTI: "public.plain-text",
      });


      Alert.alert("Exportação concluída", "Histórico exportado com sucesso!");
    } catch (error) {
      Alert.alert("Erro ao exportar", "Ocorreu um erro ao exportar o histórico.");
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container} ref={scrollViewRef}>
      <View style={styles.header}>
        <Text style={styles.restaurantName}>Cardapio Rapido</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome ou número da mesa"
        value={currentClient}
        onChangeText={setCurrentClient}
        placeholderTextColor="#8E8E8E"
      />
      <FlatList
        data={menu}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => addToOrder(item)}
          >
            <Ionicons name="fast-food-outline" size={24} color="#FF914D" />
            <View style={styles.menuDetails}>
              <Text style={styles.menuText}>{item.name}</Text>
              <Text style={styles.priceText}>R$ {item.price.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )}
        scrollEnabled={false}
      />
      <View style={styles.orderContainer}>
        <Text style={styles.orderTitle}>🛒 Pedido Atual</Text>
        {order.map((item, index) => (
          <Text key={index} style={styles.orderText}>
            {item.name} (x{item.quantity}) - R${" "}
            {(item.price * item.quantity).toFixed(2)}
          </Text>
        ))}
        <Text style={styles.totalText}>Total: R$ {total.toFixed(2)}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={saveOrderForClient}>
          <Ionicons name="save-outline" size={18} color="#FFF" />
          <Text style={styles.saveButtonText}>Registrar Pedido</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.clientOrders}>
        <Text style={styles.orderTitle}>📋 Pedidos por Cliente</Text>
        {clients.map((client, index) => (
          <View key={index} style={styles.clientContainer}>
            <Text style={styles.clientName}>
              {client.name} - Total: R$ {client.total.toFixed(2)}
            </Text>
            {client.order.map((item, i) => (
              <Text key={i} style={styles.clientOrderText}>
                {item.name} (x{item.quantity})
              </Text>
            ))}
            <TouchableOpacity
              style={styles.readyButton}
              onPress={() => markAsReady(index)}
            >
              <Ionicons name="checkmark-done-outline" size={18} color="#FFF" />
              <Text style={styles.readyButtonText}>Pronto</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={styles.historyContainer}>
        <Text style={styles.orderTitle}>📜 Histórico Diário</Text>
        {dailyHistory.length === 0 ? (
          <Text style={styles.emptyHistoryText}>
            Nenhum pedido registrado no histórico.
          </Text>
        ) : (
          dailyHistory.map((record, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyClientName}>
                {record.name} - Total: R$ {record.total.toFixed(2)}
              </Text>
              {record.order.map((item, i) => (
                <Text key={i} style={styles.historyOrderText}>
                  {item.name} (x{item.quantity})
                </Text>
              ))}
            </View>
          ))
        )}
        <TouchableOpacity
          style={styles.exportButton}
          onPress={exportDailyHistory}
        >
          <Ionicons name="download-outline" size={18} color="#FFF" />
          <Text style={styles.exportButtonText}>Exportar Histórico</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.clearHistoryButton}
          onPress={clearDailyHistory}
        >
          <Ionicons name="trash-bin-outline" size={18} color="#FFF" />
          <Text style={styles.clearHistoryButtonText}>Zerar Histórico</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 15,
  },
  header: {
    backgroundColor: "#084D6E",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#FFF",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  menuDetails: {
    marginLeft: 10,
    flex: 1,
  },
  menuText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  priceText: {
    fontSize: 16,
    color: "#666",
  },
  orderContainer: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FF914D",
  },
  orderText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF914D",
    marginTop: 10,
    textAlign: "right",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#FFF",
    marginLeft: 5,
  },
  clientOrders: {
    marginBottom: 20,
  },
  clientContainer: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  clientOrderText: {
    fontSize: 16,
    color: "#666",
  },
  readyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  readyButtonText: {
    fontSize: 16,
    color: "#FFF",
    marginLeft: 5,
  },
  historyContainer: {
    marginBottom: 20,
  },
  historyItem: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  historyClientName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  historyOrderText: {
    fontSize: 16,
    color: "#666",
  },
  emptyHistoryText: {
    fontSize: 16,
    color: "#AAA",
    textAlign: "center",
    marginTop: 10,
  },
  clearHistoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53935",
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  clearHistoryButtonText: {
    fontSize: 16,
    color: "#FFF",
    marginLeft: 5,
  },
});

