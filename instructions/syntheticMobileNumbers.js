syntheticMobileNumbers = function(provider, start, stop) {
    for(var i = start; i < stop; i++) {
        var eastAfricanCountries = [254, 255, 256, 257, 258, 260, 261, 262];
        var country = eastAfricanCountries[Math.floor(Math.random() * eastAfricanCountries.length)];
        var num = (country * 1e10) + (provider * 1e7) + i;
        var fullNumber = "+" + country + " " + provider + "-" + i;
        db.phones.insert({
            _id: num, components: { country: country, provider: provider, prefix: (i * 1e-4) << 0, number: i }, display: fullNumber
        });
        print("Inserted synthetic mobile number: " + fullNumber);
    }
    print("Done!");
}
