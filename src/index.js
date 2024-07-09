import html from '../static/webpage.html';
import MidiWriter from 'midi-writer-js';

function parseArrFromObj(inputStr) {
    try {
        const jsonObject = JSON.parse(inputStr);
        const responseString = jsonObject.response;
        const arrayMatch = responseString.match(/\[([0-9.,\s]+)\]/);

        if (arrayMatch) {
            const arrayString = arrayMatch[0];
            const numberArray = JSON.parse(arrayString);
            return numberArray;
        } else {
            throw new Error("Array not found in the response string.");
        }
    } catch (error) {
        console.error(error.message);
        return [20, 20, 20];
    }
}

async function generateMidi(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/') {
        return new Response(html, {
            headers: { 'Content-Type': 'text/html' },
        });
    } else if (request.method === 'POST' && url.pathname === '/generate') {
        const { drumPattern, bassline, synthesizers, effects, subgenre, vibes } = await request.json();

        const track = new MidiWriter.Track();
        track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));

        const generateEvent = async (pitch, duration, intensity, roleText) => {
            const messages = [
                { role: "system", content: "You are an electronic dance music creator, DJ, and enthusiast" },
                {
                    role: "user",
                    content: `${intensity}/100 represents intensity of ${roleText}. Return only an array containing 3 numbers representing duration, velocity, and repetition of the ${roleText} to help generate a ${subgenre} song with ${vibes} vibes and no other text and no other words`
                },
            ];
            const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", { messages });
            const array = parseArrFromObj(JSON.stringify(response));
            track.addEvent(new MidiWriter.NoteEvent({
                pitch,
                duration,
                velocity: parseInt(array[1]),
                repeat: parseInt(array[2]),
                sequential: true
            }));
        };

        await generateEvent(['C4', 'E4', 'G4'], '4', drumPattern, 'drum pattern');
        await generateEvent(['E2', 'G2', 'B2'], '4', bassline, 'bassline');
        await generateEvent(['C5', 'E5', 'G5'], '8', synthesizers, 'synthesizers');
        await generateEvent(['C6', 'E6', 'G6'], '16', effects, 'effects');

        const writer = new MidiWriter.Writer(track);
        const midiData = writer.buildFile();

        return new Response(midiData, {
            headers: {
                'Content-Type': 'audio/midi',
                'Content-Disposition': 'attachment; filename="generated_track.mid"'
            },
        });
    }
    return new Response('Not found', { status: 404 });
}

export default { fetch: generateMidi };
