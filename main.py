import datetime
import json
import telebot
from telebot import types
import pytz
from dotenv import load_dotenv
import os


# Load environment variables from .env file
load_dotenv()

# Get the token from the environment variable
TOKEN = os.getenv("TOKEN")

# Create a Telegram bot object
bot = telebot.TeleBot(TOKEN)

current_station = ""

# Handle '/start' command
@bot.message_handler(commands=['start'])
def start_command(message):
    global init_msg
    global user
    keyboard = types.InlineKeyboardMarkup(row_width=2)
    keyboard.add(types.InlineKeyboardButton(text="Timetable", callback_data="back"))
    init_msg = bot.send_message(message.chat.id, "Welcome to Dhaka MRT 6!", reply_markup=keyboard)
    user = message.from_user.first_name

# Handle '/stop' command
@bot.message_handler(commands=['stop'])
def stop_command(message):
    bot.send_message(message.chat.id, "Bot is shutting down.")
    bot.stop_polling()

# Handle button clicks
@bot.callback_query_handler(func=lambda call: True)
def button_click_handler(call):
    global current_station

    button_data = call.data

    # Set the current station
    current_station = button_data

    chat_id = call.message.chat.id
    message_id = call.message.message_id

    if current_station == "back":
            global init_msg

            # Get the button data
            button_data = call.data

            # Set the current station
            current_station = button_data
            # Create a ReplyKeyboardMarkup object
            keyboard = types.InlineKeyboardMarkup(row_width=2)

            # Add buttons to the keyboard
            keyboard.add(types.InlineKeyboardButton(text="Uttara North", callback_data="Uttara North"),
                          types.InlineKeyboardButton(text="Agargoan", callback_data="Agargoan"))
            keyboard.add(types.InlineKeyboardButton(text="Uttara Center", callback_data="Uttara Center"),
                          types.InlineKeyboardButton(text="Bijoy Sarani", callback_data="Bijoy Sarani"))
            keyboard.add(types.InlineKeyboardButton(text="Uttara South", callback_data="Uttara South"),
                          types.InlineKeyboardButton(text="Farmgate", callback_data="Farmgate"))
            keyboard.add(types.InlineKeyboardButton(text="Pallabi", callback_data="Pallabi"),
                          types.InlineKeyboardButton(text="Karwan Bazar", callback_data="Karwan Bazar"))
            keyboard.add(types.InlineKeyboardButton(text="Mirpur 11", callback_data="Mirpur 11"),
                          types.InlineKeyboardButton(text="Shahbag", callback_data="Shahbag"))
            keyboard.add(types.InlineKeyboardButton(text="Mirpur 10", callback_data="Mirpur 10"),
                          types.InlineKeyboardButton(text="Dhaka University", callback_data="Dhaka University"))
            keyboard.add(types.InlineKeyboardButton(text="Kazipara", callback_data="Kazipara"),
                          types.InlineKeyboardButton(text="Bangladesh Secretariat", callback_data="Bangladesh Secretariat"))
            keyboard.add(types.InlineKeyboardButton(text="Sewrapara", callback_data="Sewrapara"),
                          types.InlineKeyboardButton(text="Motijheel", callback_data="Motijheel"))
            # Send the keyboard to the user
            init_msg = bot.edit_message_text("Choose your current station:", chat_id, message_id, reply_markup=keyboard)

    else:

        # Get the button data
        button_data = call.data

        # Set the current station
        current_station = button_data

        chat_id = call.message.chat.id
        message_id = call.message.message_id

        # Get the input time value
        input_time = datetime.datetime.now(pytz.timezone('Asia/Dhaka'))
        print(input_time.strftime("%H:%M"))
        input_time = input_time.strftime("%H:%M")

        # Parse the input time into a datetime object
        print(f"User: {user}")
        print(f"Chat ID: {call.message.chat.id}")
        print(f"Current Station: {current_station}")
        print(f"Input Time: {input_time}")
        input_datetime = datetime.datetime.strptime(input_time, '%H:%M')

        with open('/workspaces/Dhaka-MRT-Timetable/data.json') as f:
            data = json.load(f).get(str(current_station))

        # Find the next three closest times in the JSON file
        next_closest_times_2 = sorted(data.get("Uttara North"), key=lambda x: (datetime.datetime.strptime(x, '%H:%M') - input_datetime).total_seconds() if datetime.datetime.strptime(x, '%H:%M') > input_datetime else float('inf'))[:3]
        next_closest_times_1 = sorted(data.get("Motijheel"), key=lambda x: (datetime.datetime.strptime(x, '%H:%M') - input_datetime).total_seconds() if datetime.datetime.strptime(x, '%H:%M') > input_datetime else float('inf'))[:3]

        # Create a new inline keyboard
        keyboard = types.InlineKeyboardMarkup(row_width=2)

        # Add inline buttons to the keyboard
        keyboard.add(types.InlineKeyboardButton(text=f"Platform 1 : {', '.join(next_closest_times_1)}", callback_data="back"))
        keyboard.add(types.InlineKeyboardButton(text=f"Platform 2 : {', '.join(next_closest_times_2)}", callback_data="back"))
        # Create a Back button
        back_button = types.InlineKeyboardButton(text="Select Station", callback_data="back")

        # Add the Back button to the bottom of the keyboard
        keyboard.add(back_button)


        # Send the inline keyboard to the user
        bot.edit_message_text(f"Upcoming Trains at {current_station}\n(Time:{input_time})\n ", chat_id, message_id, reply_markup=keyboard)

        print(f"{user} ({call.message.chat.id}):")
        print(f"Platform 1 : {', '.join(next_closest_times_1)}")
        print(f"Platform 2 : {', '.join(next_closest_times_2)}")

# Start the Telegram bot
try:
    bot.infinity_polling()
except KeyboardInterrupt:
    bot.stop_polling()