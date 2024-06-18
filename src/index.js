import html from '../static/webpage.html';
import MidiWriter from 'midi-writer-js';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (request.method === 'GET' && url.pathname === '/') {
            return new Response(html, {
                headers: { 'Content-Type': 'text/html' },
            });
        } else if (request.method === 'POST' && url.pathname === '/generate') {
            const { drumPattern, bassline, synthesizers, effects, subgenre } = await request.json();

            // Generate MIDI file based on user input
            const track = new MidiWriter.Track();
            track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));

            // Add drum pattern
            track.addEvent(new MidiWriter.NoteEvent({ 
                pitch: ['C4'],
                duration: '4',
                velocity: drumPattern / 100,
                repeat: 4
            }));

            // Add bassline
            track.addEvent(new MidiWriter.NoteEvent({ 
                pitch: ['E2'],
                duration: '1',
                velocity: bassline / 100,
                repeat: 2
            }));

            // Add synthesizers
            track.addEvent(new MidiWriter.NoteEvent({ 
                pitch: ['G4'],
                duration: '2',
                velocity: synthesizers / 100,
                repeat: 2
            }));

            // Add effects
            track.addEvent(new MidiWriter.NoteEvent({ 
                pitch: ['C5'],
                duration: '8',
                velocity: effects / 100,
                repeat: 8
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
