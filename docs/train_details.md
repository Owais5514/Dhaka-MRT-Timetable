1. Number of train timing slots (for both train towards Motijheel aka platform 1 and towards Uttara North aka platform 2). For example, user inputs 3, this means the train has three run times, say headways are 10 min, 8 min and 10 minute. You will ask how long is the first run (user inputs from 7:20 am to 8: am) and its headway. Script will calculate how any trains can run i that time and generate time for all the stations based on that. It will ask as many number of timing slots user enters for each direction.

2. Calculate the train time based on the information provided below:
    Towards Motijheel:
    Uttara North = 00
    Uttara Center = 02
    Uttara South = 05
    Pallabi = 08
    Mirpur 11 = 10
    Mirpur 10 = 12
    Kazipara = 14
    Sewrapara = 16
    Agargoan = 19
    Bijoy Sharani = 21
    Farmgate = 23
    Karwan Bazar = 25
    Shahbag = 27
    Dhaka University = 29
    Bangladesh Secretariate = 32
    Motijheel = 35

    Towards Uttara North:
    (just reverse the order of station names and times)

3. All times will be generates as per the current json file formats. Do make sure to ask the user which time-table he is genereating, for weekdays (sunday to thursday), or for friday or saturday