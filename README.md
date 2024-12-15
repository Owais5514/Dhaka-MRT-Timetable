# Dhaka-MRT-Timetable
Unofficial Dhaka MRT-6 Time schedule through telegram bot. This is a self made unofficial time table of trains arriving in all the stations. You can check the raw data for yourslef in ```data.json```. This json file was generated through observation of arrival and departure time of the stations between Uttara Center and Farmgate from my morning commute. There could be a +-1 minute error on the given time. If you happen to come accross any irregularities in a time for a station, report it though the issues tab.

## Demo
I have hosted this code on pythonanywhere for the time being. You can try out the bot for yourself by searching for @dhaka_mrt_6_bot in telegram. The bot stays active from 7 am to 9 am. If you want to host the bot yourself, you can do so by following the setup process below.

For degugging purposes, I can see the user id of who accessed the bot and which station was selected. No other data is sent to me or anywhere else

## Setup
### Prerequisites
- Python 3.8 or higher
- Telegram Bot API token

### Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/Dhaka-MRT-Timetable.git
    cd Dhaka-MRT-Timetable
    ```

2. Create a virtual environment and activate it:
    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Install the required packages:
    ```sh
    pip install -r requirements.txt
    ```

### Configuration
1. Create a `.env` file in the root directory and add your Telegram Bot API token:
    ```env
    TOKEN = our_telegram_api_token
    ```

### Running the Bot
1. Start the bot:
    ```sh
    python bot.py
    ```

2. Your bot should now be running and ready to use.
