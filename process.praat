form Give the parameters for pause analysis
   comment soundname:
    text soundname 1.wav
   comment outputFileName.csv:
    text outputFileName result.csv
endform

min_f0 = 75
max_f0 = 350

Read from file: soundname$
soundname$ = selected$ ("Sound")

select Sound 'soundname$'
# https://www.fon.hum.uva.nl/praat/manual/Sound__To_Formant__burg____.html
formant = To Formant (burg): 0, 2, 5000, 0.049, 50
formantStep = Get time step


selectObject: formant
table = Down to Table: "no", "yes", 6, "yes", 3, "yes", 3, "yes"
numberOfRows = Get number of rows

select Sound 'soundname$'
pitch = To Pitch: 0, min_f0, max_f0

selectObject: table
Append column: "Pitch"

for step to numberOfRows
    selectObject: table
    t = Get value: step, "time(s)"

    selectObject: pitch
    pitchValue = Get value at time: t, "Hertz", "Nearest"

    selectObject: table
    Set numeric value: step, "Pitch", pitchValue
endfor


#export to csv
selectObject: table
Save as comma-separated file: outputFileName$
removeObject(table)

echo Ok