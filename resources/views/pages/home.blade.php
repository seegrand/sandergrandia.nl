@extends('html')

@section('title', 'Software Development')

@section('head.additional')
    <link rel="stylesheet" href="{{ asset('css/home.css') }}"/>
@endsection

@section('content')
    <div class="flex-center position-ref full-height">

        <div class="content">
            <div class="logo m-b-md">
                <img src="{{ asset('images/logo/logo.png') }}" alt="logo">
            </div>

            <div class="links">
                <a href="{{ url('/terminal') }}"><i class="fas fa-terminal"></i>&nbsp;Terminal<span class="blinking-cursor">|</span></a>
                <a href="https://www.linkedin.com/in/sandergrandia/"><i class="fab fa-linkedin"></i>&nbsp;Linkedin</a>
                <a href="https://github.com/seegrand"><i class="fab fa-github"></i>&nbsp;Github</a>
                <a href="https://www.instagram.com/seegrand_"><i class="fab fa-instagram"></i>&nbsp;Instagram</a>
                <a href="https://sander.grandia.it/"><i class="fas fa-address-card"></i>&nbsp;About</a>
            </div>
        </div>
    </div>
    <div class="footer">
        <div class="kvk small">
            KVK: 78606691
        </div>
        <div class="vat small">
            BTW: B01 225593282B010270
        </div>
    </div>
@endsection
