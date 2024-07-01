import html from '../static/webpage.html';
import MidiWriter from 'midi-writer-js';

function parseArrFromObj(inputStr) {
    const jsonObject = JSON.parse(inputStr);
    const responseString = jsonObject.response;
    const arrayMatch = responseString.match(/\[([0-9.,\s]+)\]/);

    if (arrayMatch) {
        const arrayString = arrayMatch[0];
        const numberArray = JSON.parse(arrayString);
        return numberArray;
    } else {
        console.error("Array not found in the response string.");
        return [20, 20, 20];
    }
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (request.method === 'GET' && url.pathname === '/') {
            return new Response(html, {
                headers: { 'Content-Type': 'text/html' },
            });
        } else if (request.method === 'POST' && url.pathname === '/generate') {
            const { drumPattern, bassline, synthesizers, effects, subgenre, vibes } = await request.json();
            console.log(`drumPattern ${drumPattern}, bassline ${bassline}, synth ${synthesizers}, effects ${effects}, subgenre ${subgenre}, vibes ${vibes}`);

            const track = new MidiWriter.Track();
            track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));

            let messages = [
                { role: "system", content: "You are an electronic dance music creator, DJ, and enthusiast" },
                {
                    role: "user",
                    content: `${drumPattern}/100 represents intensity of drum pattern. Return only an array containing 3 numbers representing duration, velocity, and repetition of the drum pattern to help generate a ${subgenre} song with ${vibes} vibes and no other text and no other words`
                },
            ];
            const drumPatResp = await env.AI.run(
                "@cf/meta/llama-3-8b-instruct",
                { messages }
            );
            const drumArr = parseArrFromObj(JSON.stringify(drumPatResp));
            track.addEvent(new MidiWriter.NoteEvent({
                pitch: ['C4', 'E4', 'G4'],
                duration: '4',
                velocity: parseInt(drumArr[1]),
                repeat: parseInt(drumArr[2]),
                sequential: true
            }));

            messages = [
                { role: "system", content: "You are an electronic dance music creator, DJ, and enthusiast" },
                {
                    role: "user",
                    content: `${bassline}/100 represents intensity of bassline. Return only an array containing 3 numbers representing duration (1 for whole, 2 for half, or d2 for dotted half), velocity, and repetition of the bassline to help generate a ${subgenre} song with ${vibes} vibes and no other text and no other words`
                },
            ];
            const basslinePatResp = await env.AI.run(
                "@cf/meta/llama-3-8b-instruct",
                { messages }
            );
            const basslineArr = parseArrFromObj(JSON.stringify(basslinePatResp));
            track.addEvent(new MidiWriter.NoteEvent({
                pitch: ['E2', 'G2', 'B2'],
                duration: '4',
                velocity: parseInt(basslineArr[1]),
                repeat: parseInt(basslineArr[2]),
                sequential: true
            }));

            messages = [
                { role: "system", content: "You are an electronic dance music creator, DJ, and enthusiast" },
                {
                    role: "user",
                    content: `${synthesizers}/100 represents intensity of synthesizers. Return only an array containing 3 numbers representing duration, velocity, and repetition of the synthesizers to help generate a ${subgenre} song with ${vibes} vibes and no other text and no other words`
                },
            ];
            const synthPatResp = await env.AI.run(
                "@cf/meta/llama-3-8b-instruct",
                { messages }
            );
            const synthlineArr = parseArrFromObj(JSON.stringify(synthPatResp));
            track.addEvent(new MidiWriter.NoteEvent({
                pitch: ['C5', 'E5', 'G5'],
                duration: '8',
                velocity: parseInt(synthlineArr[1]),
                repeat: parseInt(synthlineArr[2]),
                sequential: true
            }));

            messages = [
                { role: "system", content: "You are an electronic dance music creator, DJ, and enthusiast" },
                {
                    role: "user",
                    content: `${effects}/100 represents intensity of effects. Return only an array containing 3 numbers representing duration, velocity, and repetition of the effects to help generate a ${subgenre} song with ${vibes} vibes and no other text and no other words`
                },
            ];
            const effectsPatResp = await env.AI.run(
                "@cf/meta/llama-3-8b-instruct",
                { messages }
            );
            const effectsArr = parseArrFromObj(JSON.stringify(effectsPatResp));
            track.addEvent(new MidiWriter.NoteEvent({
                pitch: ['C6', 'E6', 'G6'],
                duration: '16',
                velocity: parseInt(effectsArr[1]),
                repeat: parseInt(effectsArr[2]),
                sequential: true
            }));

            const write = new MidiWriter.Writer(track);
            const midiData = write.buildFile();

            return new Response(midiData, {
                headers: {
                    'Content-Type': 'audio/midi',
                    'Content-Disposition': 'attachment; filename="generated_track.mid"'
                },
            });
        }

        return new Response('Not found', { status: 404 });
    }
}

