const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../server/database.sqlite');
const db = new sqlite3.Database(dbPath);

const rawData = `MERV ARANHA	saranha@hotmail.com
MATTHEW BAKER	matthew@champconsultants.co.uk
GUS BARNETT	gus@gold-design.co.uk
NICOLE BARNETT	mayflower801@gmail.com
DAVID BARRETT	dgb6@hotmail.co.uk
STEF BARRETT	Stefandnonsense@hotmail.com
CLAUDE BERTIN	Claudebertin2875@gmail.com
SUE COOK	s.cook123@hotmail.co.uk
MIKE DALTON	michaelndalton@aol.com
LOUIS DE SOUZA	louisdesouza@gmail.com
ROGER EASTER	rogereaster20@gmail.com
RON FISH	gracefish2@gmail.com
PETER FREEBODY	peter.freebody@sky.com
SUZANNE FREEBODY	suzanne.freebody@sky.com
PETER GEORGIADES	petergeorgiades@hotmail.co.uk
YVONNE GOMES	yvegomes@gmail.com
DEREK GRANT	derekggrant@hotmail.co.uk
DAVID HAMES	david.deedee21@outlook.com 
TONY HAMILTON	tonynjack@hotmail.com
GERAINT JENKINS	geraintjenkins01@gmail.com
DAVID KNIGHT	kevin.g@knights-gc.co.uk
KEITH LAWRANCE	klaw.klaw@ntlworld.com
GEOFF LOVEDAY	geoff.loveday@googlemail.com
PETER LYONS	plyons19@btinternet.com
ANDY MACLENNAN	andrew_maclennan@outlook.com
DAVID MOLE	dhmole@hotmail.co.uk
DEREK NEWLAND	derek@emailnewland.co.uk
GLEN O'DWYER	glen@comp-solutions.co.uk
MIKE O'REILLY	Rnikeoreilly@gmail.com
ANDY PARR	andy@caterhamhill.co.uk
MIKE PEACHMAN	Yrator1945@gmail.com
BILL RIDLEY	ridleyb70@gmail.com
MALCOLM RUSSELL	mrussell500@btinternet.com
NICKY RUSSELL	nicolarussell102@btinternet.com
MARK SCOGGINS	MarkScoggins@cantab.net
MIKE SMITH	michael1947smith@gmail.com
COLIN VANE	ColinVane0611@gmail.com
JIM WALKER	walkerprco@aol.com
STEVE WOPLIN	stevewoplin@talktalk.net
RICHARD  YORK	rgycatrty@gmail.com
HON MEMBERS	
ROB BURCHETT	rburchett57@gmail.com
GODFREY JOHNSON	uplandsfarm@btinternet.com
LIFE HONORARY MEMBER	
BILL MAYES	a-mayes@sky.com
ASSOCIATE MEMBERS	
MIA WILSON 	miawilson133@gmail.com
ANDREW BROWNLESS	andrew.brownless@icloud.com
ANNE BROWNLESS	anne.brownless@ntlworld.com
WILLIAM EDWARDS	we38599@gmail.com`;

const lines = rawData.split('\n');
const members = [];

let currentCategory = 'Member';

lines.forEach(line => {
    let trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed === '42') return;

    if (trimmed.includes('HON MEMBERS')) { currentCategory = 'Honorary Member'; return; }
    if (trimmed.includes('LIFE HONORARY')) { currentCategory = 'Life Honorary Member'; return; }
    if (trimmed.includes('ASSOCIATE MEMBERS')) { currentCategory = 'Associate Member'; return; }

    // Split by tabs or multiple spaces
    const parts = trimmed.split(/[\t]+/);

    if (parts.length >= 2) {
        let name = parts[0].trim();
        let email = parts[1].trim();

        // Remove '42' or other artifacts if present
        if (name === '42') return;

        // Split name (Naive: Last word is surname)
        const nameParts = name.split(' ');
        let lastName = '';
        let firstName = '';

        if (nameParts.length > 1) {
            lastName = nameParts.pop();
            firstName = nameParts.join(' ');
        } else {
            firstName = name;
        }

        // Capitalize Name
        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        firstName = firstName.split(' ').map(capitalize).join(' ');
        lastName = capitalize(lastName);

        members.push({
            firstName,
            lastName,
            email,
            phone: '',
            role: currentCategory,
            vocation: 'Unknown',
            status: 'Active',
            joinDate: new Date().toISOString().split('T')[0],
            dob: '1980-01-01',
            attendance: 100,
            serviceHours: 0,
            imageUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=f3f4f6&color=6b7280&size=128`,
            bio: "Member"
        });
    }
});

db.serialize(() => {
    console.log("Clearing existing members...");
    db.run("DELETE FROM members");
    db.run("DELETE FROM sqlite_sequence WHERE name='members'");

    const stmt = db.prepare(`INSERT INTO members (firstName, lastName, email, phone, role, vocation, joinDate, dob, status, attendance, serviceHours, imageUrl, bio) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);

    db.run("BEGIN TRANSACTION");
    members.forEach(m => {
        stmt.run(m.firstName, m.lastName, m.email, m.phone, m.role, m.vocation, m.joinDate, m.dob, m.status, m.attendance, m.serviceHours, m.imageUrl, m.bio);
    });
    db.run("COMMIT", (err) => {
        if (err) console.error(err);
        else console.log(`Successfully seeded ${members.length} members.`);
        stmt.finalize();
    });
});

db.close();
