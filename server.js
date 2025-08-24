// 🚛 FREIGHTPRO EXPRESS.JS BACKEND SERVER
// Professional FMCSA API integration with caching and error handling

import express from 'express';
import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 4000;

// 🛡️ MIDDLEWARE & SECURITY
app.use(cors({
    origin: ['https://freightpro.netlify.app', 'http://localhost:3000', 'http://localhost:8000'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🚦 RATE LIMITING (Professional API protection)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// 🗄️ SIMPLE IN-MEMORY CACHE (Replace with Redis/DB in production)
const fmcsaCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// 🚛 FMCSA DATA FETCHING FUNCTION (Professional Implementation)
async function getFMCSAData(type, number) {
    const cacheKey = `${type.toUpperCase()}_${number}`;
    
    // Check cache first
    const cached = fmcsaCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log(`✅ Cache hit for ${cacheKey}`);
        return { ...cached.data, source: 'cache' };
    }
    
    // Call FMCSA SAFER XML API
    const url = `https://safer.fmcsa.dot.gov/CompanySnapshotXML?query_param=${type.toUpperCase()}&query_string=${number}`;
    console.log(`🌐 Calling FMCSA API: ${url}`);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/xml',
                'User-Agent': 'FreightPro/1.0 (Professional Load Board Platform)',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            timeout: 10000 // 10 second timeout
        });
        
        if (!response.ok) {
            throw new Error(`FMCSA request failed (${response.status}): ${response.statusText}`);
        }
        
        const xml = await response.text();
        console.log(`✅ FMCSA XML response received, length: ${xml.length}`);
        
        // Parse XML to JSON
        const json = await parseStringPromise(xml, { 
            explicitArray: false,
            trim: true,
            normalize: true
        });
        
        if (!json.CompanySnapshot) {
            throw new Error('Invalid response from FMCSA - no CompanySnapshot found');
        }
        
        const company = json.CompanySnapshot;
        
        // 🎯 PROFESSIONAL DATA STRUCTURE (Exactly what ChatGPT recommended)
        const companyData = {
            legalName: company.LegalName || 'N/A',
            dbaName: company.DBAName || 'N/A',
            usdot: company.USDOTNumber || 'N/A',
            mcNumber: company.MCNumber || 'N/A',
            entityType: company.EntityType || 'N/A',
            operatingStatus: company.OperatingStatus || 'N/A',
            authorityType: company.AuthorityType || 'N/A',
            authorityStatus: company.AuthorityStatus || 'N/A',
            outOfService: company.OutOfServiceDate || 'N/A',
            formDate: company.MCS150FormDate || 'N/A',
            mileage: company.MCS150Mileage || 'N/A',
            address: {
                street: company.Address?.Street || company.PhyStreet || 'N/A',
                city: company.Address?.City || company.PhyCity || 'N/A',
                state: company.Address?.State || company.PhyState || 'N/A',
                zip: company.Address?.Zip || company.PhyZip || 'N/A'
            },
            // Additional professional fields
            safetyRating: company.SafetyRating || 'N/A',
            insurance: {
                liability: company.LiabilityInsuranceAmount || 'N/A',
                cargo: company.CargoInsuranceAmount || 'N/A',
                expiration: company.InsuranceExpirationDate || 'N/A'
            },
            bond: {
                number: company.BondNumber || 'N/A',
                amount: company.BondAmount || 'N/A',
                expiration: company.BondExpirationDate || 'N/A'
            }
        };
        
        // Cache the successful response
        fmcsaCache.set(cacheKey, {
            data: companyData,
            timestamp: Date.now()
        });
        
        console.log(`✅ Company data parsed successfully: ${companyData.legalName}`);
        return { ...companyData, source: 'FMCSA API' };
        
    } catch (error) {
        console.error(`❌ FMCSA API error for ${type} ${number}:`, error.message);
        
        // Return structured error response
        return { 
            error: error.message,
            details: 'FMCSA API call failed',
            suggestion: 'Verify the number and try again, or contact support if the issue persists'
        };
    }
}

// 🏦 LICENSING & INSURANCE (L&I) FALLBACK SYSTEM
async function getLIData(mcNumber) {
    const url = `https://li-public.fmcsa.dot.gov/LIVIEW/pkg_html.prc_liview?do_search=MC&mc=${mcNumber}`;
    console.log(`🌐 Calling FMCSA L&I System: ${url}`);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'FreightPro/1.0 (Professional Load Board Platform)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 15000 // 15 second timeout for L&I
        });
        
        if (!response.ok) {
            throw new Error(`L&I request failed (${response.status})`);
        }
        
        const html = await response.text();
        
        // Basic insurance data extraction (enhance this based on actual L&I page structure)
        const insuranceData = {
            source: 'FMCSA L&I System',
            insurance: {
                liability: 'Available in L&I System',
                cargo: 'Available in L&I System',
                expiration: 'Check L&I System for details'
            },
            bond: {
                number: 'Available in L&I System',
                amount: 'Available in L&I System',
                expiration: 'Check L&I System for details'
            }
        };
        
        return insuranceData;
        
    } catch (error) {
        console.error(`❌ L&I System error:`, error.message);
        return { error: 'L&I System unavailable', details: error.message };
    }
}

// 🎯 MAIN FMCSA API ENDPOINT (Exactly as ChatGPT recommended)
app.get('/api/fmcsa/:type/:number', async (req, res) => {
    const { type, number } = req.params;
    
    // 🛡️ INPUT VALIDATION
    if (!['USDOT', 'MC'].includes(type.toUpperCase())) {
        return res.status(400).json({ 
            error: 'Invalid type parameter',
            message: 'Type must be USDOT or MC',
            validTypes: ['USDOT', 'MC']
        });
    }
    
    if (!number || number.trim().length === 0) {
        return res.status(400).json({ 
            error: 'Missing number parameter',
            message: 'Please provide a valid USDOT or MC number'
        });
    }
    
    // 🚛 FETCH FMCSA DATA
    console.log(`🔍 Fetching FMCSA data for ${type.toUpperCase()}: ${number}`);
    
    try {
        const data = await getFMCSAData(type.toUpperCase(), number.trim());
        
        if (data.error) {
            // API error - return structured error response
            return res.status(500).json({
                error: 'FMCSA API Error',
                message: data.error,
                details: data.details,
                suggestion: data.suggestion,
                timestamp: new Date().toISOString(),
                requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });
        }
        
        // 🎯 SUCCESS RESPONSE (Professional structure)
        res.json({
            success: true,
            data: data,
            metadata: {
                timestamp: new Date().toISOString(),
                source: data.source,
                cacheStatus: data.source === 'cache' ? 'cached' : 'fresh',
                requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
        });
        
    } catch (error) {
        console.error(`❌ Server error for ${type} ${number}:`, error);
        
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching FMCSA data',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Contact support for assistance',
            timestamp: new Date().toISOString(),
            requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
    }
});

// 🏦 L&I SYSTEM ENDPOINT
app.get('/api/fmcsa/li/:mcNumber', async (req, res) => {
    const { mcNumber } = req.params;
    
    if (!mcNumber || mcNumber.trim().length === 0) {
        return res.status(400).json({ 
            error: 'Missing MC number parameter',
            message: 'Please provide a valid MC number'
        });
    }
    
    try {
        const data = await getLIData(mcNumber.trim());
        
        if (data.error) {
            return res.status(500).json({
                error: 'L&I System Error',
                message: data.error,
                details: data.details,
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({
            success: true,
            data: data,
            metadata: {
                timestamp: new Date().toISOString(),
                source: 'FMCSA L&I System'
            }
        });
        
    } catch (error) {
        console.error(`❌ L&I server error:`, error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch L&I data',
            timestamp: new Date().toISOString()
        });
    }
});

// 🏥 HEALTH CHECK ENDPOINT
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'FreightPro FMCSA API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        cache: {
            size: fmcsaCache.size,
            maxAge: '24 hours'
        }
    });
});

// 🚀 START SERVER
app.listen(PORT, () => {
    console.log(`🚛 FreightPro FMCSA API Server running on port ${PORT}`);
    console.log(`🌐 FMCSA Endpoint: http://localhost:${PORT}/api/fmcsa/:type/:number`);
    console.log(`🏦 L&I Endpoint: http://localhost:${PORT}/api/fmcsa/li/:mcNumber`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`✅ Ready to serve professional FMCSA data!`);
});

// 🛡️ GRACEFUL SHUTDOWN
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    process.exit(0);
});
