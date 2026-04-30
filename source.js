// Purpose: Main index
// Created on: 4/29/26 @ 11:10 PM

const main = async () => {
    // TODO: More than just Left 4 Dead 2?
    console.log("Getting mods")

    const mods = await (await fetch("http://10.0.44.20:5113/Mods/Left 4 Dead 2/data.json")).json()

    console.log(`Loaded: ${mods.response.resultcount} mods`)


}

main()