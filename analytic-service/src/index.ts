import { Kafka } from "kafkajs";

type CartItem = {
  price: number;
};

const kafka = new Kafka({
  clientId: "analytic-service",
  brokers: ["localhost:9094", "localhost:9095", "localhost:9096"],
});

const consumer = kafka.consumer({ groupId: "analytic-service" });

const run = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({
      topics: ["payment-successful", "order-successful", "email-successful"],
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) {
          return;
        }

        const value = message.value.toString();

        switch (topic) {
          case "payment-successful":
            {
              const { userId, cart }: { userId: string; cart: CartItem[] } = JSON.parse(value);

              const total = cart
                .reduce<number>((acc, item: CartItem) => acc + item.price, 0)
                .toFixed(2);

              console.log(`Analytic consumer: User ${userId} paid ${total}`);
            }
            break;
          case "order-successful":
            {
              const { userId, orderId }: { userId: string; orderId: string } = JSON.parse(value);

              console.log(`Analytic consumer: Order id ${orderId} created for user id ${userId}`);
            }
            break;
          case "email-successful":
            {
              const { userId, emailId }: { userId: string; emailId: string } = JSON.parse(value);

              console.log(`Analytic consumer: Email id ${emailId} sent to user id ${userId}`);
            }
            break;

          default:
            break;
        }
      },
    });
  } catch (err) {
    console.log(err);
  }
};

run();