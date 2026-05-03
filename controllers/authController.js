const jwt = require('jsonwebtoken');

const login = (req, res) => {
  const { username, password } = req.body;

  console.log('Login attempt:', { username, receivedPassword: password });
  console.log('Expected:', { 
    expectedUsername: process.env.ADMIN_USERNAME, 
    expectedPassword: process.env.ADMIN_PASSWORD 
  });

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  // Check credentials against environment variables
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    console.log('✅ Login successful');
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful',
      token
    });
  }

  console.log('❌ Invalid credentials');
  return res.status(401).json({ message: 'Invalid credentials' });
};

module.exports = { login };
